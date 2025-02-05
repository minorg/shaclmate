import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import type {
  MintingStrategy,
  PropertyVisibility,
} from "../../../enums/index.js";
import type { IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { Property } from "./Property.js";

export class IdentifierProperty extends Property<IdentifierType> {
  readonly abstract: boolean;
  readonly equalsFunction = "booleanEquals";
  readonly mutable = false;
  private readonly classDeclarationVisibility: Maybe<PropertyVisibility>;
  private readonly lazyObjectTypeMutable: () => boolean;
  private readonly mintingStrategy: MintingStrategy | "blankNode" | "none";
  private readonly override: boolean;

  constructor({
    abstract,
    classDeclarationVisibility,
    lazyObjectTypeMutable,
    mintingStrategy,
    override,
    ...superParameters
  }: {
    abstract: boolean;
    classDeclarationVisibility: Maybe<PropertyVisibility>;
    lazyObjectTypeMutable: () => boolean;
    mintingStrategy: Maybe<MintingStrategy>;
    override: boolean;
    type: IdentifierType;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    invariant(this.visibility === "public");
    this.abstract = abstract;
    this.classDeclarationVisibility = classDeclarationVisibility;
    if (mintingStrategy.isJust()) {
      this.mintingStrategy = mintingStrategy.unsafeCoerce();
    } else if (this.type.nodeKinds.has("BlankNode")) {
      this.mintingStrategy = "blankNode";
    } else {
      this.mintingStrategy = "none";
    }
    this.lazyObjectTypeMutable = lazyObjectTypeMutable;
    this.override = override;
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    if (this.abstract) {
      return Maybe.empty();
    }

    let mintIdentifier: string;
    switch (this.mintingStrategy) {
      case "blankNode":
        mintIdentifier = "dataFactory.blankNode()";
        break;
      case "none":
        // If there's no minting strategy the identifier will be required by the constructor and assigned to a public property.
        return Maybe.empty();
      case "sha256":
        mintIdentifier =
          "dataFactory.namedNode(`urn:shaclmate:object:${this.type}:${this.hash(sha256.create())}`)";
        break;
      case "uuidv4":
        mintIdentifier =
          "dataFactory.namedNode(`urn:shaclmate:object:${this.type}:${uuid.v4()}`)";
        break;
    }

    return Maybe.of({
      leadingTrivia: this.override ? "override " : undefined,
      name: this.name,
      returnType: this.type.name,
      statements: [
        this.lazyObjectTypeMutable()
          ? `return (typeof this._${this.name} !== "undefined") ? this._${this.name} : ${mintIdentifier}`
          : `if (typeof this._${this.name} === "undefined") { this._${this.name} = ${mintIdentifier}; } return this._${this.name};`,
      ],
    } satisfies OptionalKind<GetAccessorDeclarationStructure>);
  }

  override get classPropertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    if (this.abstract) {
      // Abstract version of the accessor
      // Work around a ts-morph bug that puts the override keyword before the abstract keyword
      return Maybe.of({
        hasOverrideKeyword:
          this.abstract && this.override ? undefined : this.override,
        isAbstract: this.abstract && this.override ? undefined : this.abstract,
        isReadonly: true,
        leadingTrivia:
          this.abstract && this.override ? "abstract override " : undefined,
        name: this.name,
        type: this.type.name,
      });
    }

    // See note in TypeFactory re: the logic of whether to declare the identifier in the class or not.
    if (!this.classDeclarationVisibility.isJust()) {
      return Maybe.empty();
    }

    switch (this.mintingStrategy) {
      case "none":
        // Immutable, public identifier property, no getter
        return Maybe.of({
          isReadonly: true,
          name: this.name,
          type: this.type.name,
        });
      default:
        // Mutable _identifier property that will be lazily initialized by the getter to mint the identifier
        return Maybe.of({
          name: `_${this.name}`,
          scope: this.classDeclarationVisibility
            .map(Property.visibilityToScope)
            .unsafeCoerce(),
          type: `${this.type.name} | undefined`,
        });
    }
  }

  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    if (this.objectType.declarationType === "class" && this.abstract) {
      return Maybe.empty();
    }

    return Maybe.of({
      hasQuestionToken:
        this.objectType.declarationType === "class" &&
        this.mintingStrategy !== "none",
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  override get declarationImports(): readonly Import[] {
    const imports = this.type.useImports().concat();

    if (
      this.objectType.features.has("hash") &&
      this.objectType.declarationType === "class"
    ) {
      switch (this.mintingStrategy) {
        case "sha256":
          imports.push(Import.SHA256);
          break;
        case "uuidv4":
          imports.push(Import.UUID);
          break;
      }
    }

    return imports;
  }

  override get interfacePropertySignature(): OptionalKind<PropertySignatureStructure> {
    return {
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    };
  }

  override get jsonPropertySignature(): OptionalKind<PropertySignatureStructure> {
    return {
      isReadonly: true,
      name: "@id",
      type: "string",
    };
  }

  override get snippetDeclarations(): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (this.objectType.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.booleanEquals);
    }
    return snippetDeclarations;
  }

  override classConstructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["classConstructorStatements"]
  >[0]): readonly string[] {
    if (this.abstract) {
      return [];
    }
    return this.classPropertyDeclaration
      .map((classPropertyDeclaration) => [
        `this.${classPropertyDeclaration.name} = ${variables.parameter};`,
      ])
      .orDefault([]);
  }

  override fromJsonStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["fromJsonStatements"]
  >[0]): readonly string[] {
    return [
      `const ${this.name} = ${this.type.fromJsonExpression({ variables: { value: variables.jsonObject } })};`,
    ];
  }

  override fromRdfStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["fromRdfStatements"]
  >[0]): readonly string[] {
    return [`const ${this.name} = ${variables.resource}.identifier`];
  }

  override hashStatements(): readonly string[] {
    return [];
  }

  override interfaceConstructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["interfaceConstructorStatements"]
  >[0]): readonly string[] {
    return [`const ${this.name} = ${variables.parameter}`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    Property<IdentifierType>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    return Maybe.of(
      `{ label: "Identifier", scope: \`\${${variables.scopePrefix}}/properties/${this.jsonPropertySignature.name}\`, type: "Control" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Property<IdentifierType>["jsonZodSchema"]>[0]): ReturnType<
    Property<IdentifierType>["jsonZodSchema"]
  > {
    return {
      key: this.jsonPropertySignature.name,
      schema: `${variables.zod}.string().min(1)`,
    };
  }

  override sparqlConstructTemplateTriples(): readonly string[] {
    return [];
  }

  override sparqlWherePatterns(): readonly string[] {
    return [];
  }

  override toJsonObjectMember({
    variables,
  }: Parameters<Property<IdentifierType>["toJsonObjectMember"]>[0]): string {
    const nodeKinds = [...this.type.nodeKinds];
    const valueToNodeKinds = nodeKinds.map((nodeKind) => {
      switch (nodeKind) {
        case "BlankNode":
          return `\`_:\${${variables.value}.value}\``;
        case "NamedNode":
          return `${variables.value}.value`;
        default:
          throw new RangeError(nodeKind);
      }
    });
    if (valueToNodeKinds.length === 1) {
      return `"@id": ${valueToNodeKinds[0]}`;
    }
    invariant(valueToNodeKinds.length === 2);
    return `"@id": ${variables.value}.termType === "${nodeKinds[0]}" ? ${valueToNodeKinds[0]} : ${valueToNodeKinds[1]}`;
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
