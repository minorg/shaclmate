import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import type {
  IdentifierMintingStrategy,
  PropertyVisibility,
} from "../../../enums/index.js";
import type { IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { Property } from "./Property.js";

export class IdentifierProperty extends Property<IdentifierType> {
  readonly abstract: boolean;
  readonly equalsFunction = "$booleanEquals";
  readonly mutable = false;
  private readonly classDeclarationVisibility: Maybe<PropertyVisibility>;
  private readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  private readonly override: boolean;

  constructor({
    abstract,
    classDeclarationVisibility,
    identifierMintingStrategy,
    override,
    ...superParameters
  }: {
    abstract: boolean;
    classDeclarationVisibility: Maybe<PropertyVisibility>;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    override: boolean;
    type: IdentifierType;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    invariant(this.visibility === "public");
    this.abstract = abstract;
    this.classDeclarationVisibility = classDeclarationVisibility;
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.override = override;
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    if (this.abstract) {
      return Maybe.empty();
    }

    if (this.identifierMintingStrategy.isNothing()) {
      return Maybe.empty();
    }

    let memoizeMintedIdentifier: boolean;
    let mintIdentifier: string;
    switch (this.identifierMintingStrategy.unsafeCoerce()) {
      case "blankNode":
        memoizeMintedIdentifier = true;
        mintIdentifier = "dataFactory.blankNode()";
        break;
      case "sha256":
        // If the object is mutable don't memoize the minted identifier, since the hash will change if the object mutates.
        memoizeMintedIdentifier = !this.objectType.mutable();
        mintIdentifier =
          "dataFactory.namedNode(`${this.identifierPrefix}${this.hashShaclProperties(sha256.create())}`)";
        break;
      case "uuidv4":
        memoizeMintedIdentifier = true;
        mintIdentifier =
          "dataFactory.namedNode(`${this.identifierPrefix}${uuid.v4()}`)";
        break;
    }

    return Maybe.of({
      leadingTrivia: this.override ? "override " : undefined,
      name: this.name,
      returnType: this.type.name,
      statements: [
        memoizeMintedIdentifier
          ? `if (typeof this._${this.name} === "undefined") { this._${this.name} = ${mintIdentifier}; } return this._${this.name};`
          : `return (typeof this._${this.name} !== "undefined") ? this._${this.name} : ${mintIdentifier}`,
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

    if (this.identifierMintingStrategy.isJust()) {
      // Mutable _identifier property that will be lazily initialized by the getter to mint the identifier
      return Maybe.of({
        name: `_${this.name}`,
        scope: this.classDeclarationVisibility
          .map(Property.visibilityToScope)
          .unsafeCoerce(),
        type: `${this.type.name} | undefined`,
      });
    }

    // Immutable, public identifier property, no getter
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    if (this.objectType.declarationType === "class" && this.abstract) {
      return Maybe.empty();
    }

    const typeNames = new Set<string>(); // Remove duplicates with a set
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName !== "undefined") {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    return Maybe.of({
      hasQuestionToken:
        this.objectType.declarationType === "class" &&
        this.identifierMintingStrategy.isJust(),
      isReadonly: true,
      name: this.name,
      type: [...typeNames].sort().join(" | "),
    });
  }

  override get declarationImports(): readonly Import[] {
    const imports = this.type.useImports().concat();

    if (
      this.objectType.features.has("hash") &&
      this.objectType.declarationType === "class"
    ) {
      this.identifierMintingStrategy.ifJust((identifierMintingStrategy) => {
        switch (identifierMintingStrategy) {
          case "sha256":
            imports.push(Import.SHA256);
            break;
          case "uuidv4":
            imports.push(Import.UUID);
            break;
        }
      });
    }

    return imports;
  }

  override get interfacePropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: "@id",
      type: "string",
    });
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
    if (this.classPropertyDeclaration.isNothing()) {
      return [];
    }
    const classPropertyDeclaration =
      this.classPropertyDeclaration.unsafeCoerce();

    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      return [
        `this.${classPropertyDeclaration.name} = ${variables.parameter};`,
      ];
    }
    const statements: string[] = [];
    for (const conversion of this.type.conversions) {
      invariant(conversion.sourceTypeName !== "undefined");
      statements.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { this.${classPropertyDeclaration.name} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }

    if (classPropertyDeclaration.name.startsWith("_")) {
      statements.push(`if (typeof ${variables.parameter} === "undefined") { }`);
    }

    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    statements.push(
      `{ this.${classPropertyDeclaration.name} =( ${variables.parameter}) as never;\n }`,
    );

    return [statements.join(" else ")];
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
    if (this.type.in_.length > 0 && this.type.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      return [
        `let ${this.name}: ${this.type.name};`,
        `switch (${variables.resource}.identifier.value) { ${this.type.in_.map((iri) => `case "${iri.value}": ${this.name} = ${this.rdfjsTermExpression(iri)}; break;`).join(" ")} default: return purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: ${variables.resource}.identifier, expectedValueType: ${JSON.stringify(this.type.name)}, focusResource: ${variables.resource}, predicate: ${this.rdfjsTermExpression(rdf.subject)} })); }`,
      ];
    }
    return [`const ${this.name} = ${variables.resource}.identifier`];
  }

  override hashStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["hashStatements"]
  >[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.value);`];
  }

  override interfaceConstructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["interfaceConstructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      return [`const ${this.name} = ${variables.parameter};`];
    }
    const statements: string[] = [`let ${this.name}: ${this.type.name};`];
    const conversionBranches: string[] = [];
    for (const conversion of this.type.conversions) {
      conversionBranches.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${this.name} = ${conversion.conversionExpression(variables.parameter)}; }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      `{ ${this.name} =( ${variables.parameter}) as never;\n }`,
    );
    statements.push(conversionBranches.join(" else "));
    return statements;
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    Property<IdentifierType>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    return Maybe.of(
      `{ label: "Identifier", scope: \`\${${variables.scopePrefix}}/properties/${this.jsonPropertySignature.unsafeCoerce().name}\`, type: "Control" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Property<IdentifierType>["jsonZodSchema"]>[0]): ReturnType<
    Property<IdentifierType>["jsonZodSchema"]
  > {
    let schema: string;
    if (this.type.in_.length > 0 && this.type.isNamedNodeKind) {
      // Treat sh:in as a union of the IRIs
      // rdfjs.NamedNode<"http://example.com/1" | "http://example.com/2">
      schema = `${variables.zod}.enum(${JSON.stringify(this.type.in_.map((iri) => iri.value))})`;
    } else {
      schema = `${variables.zod}.string().min(1)`;
    }

    return Maybe.of({
      key: this.jsonPropertySignature.unsafeCoerce().name,
      schema,
    });
  }

  override sparqlConstructTemplateTriples(): readonly string[] {
    return [];
  }

  override sparqlWherePatterns(): readonly string[] {
    return [];
  }

  override toJsonObjectMember({
    variables,
  }: Parameters<
    Property<IdentifierType>["toJsonObjectMember"]
  >[0]): Maybe<string> {
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
      return Maybe.of(`"@id": ${valueToNodeKinds[0]}`);
    }
    invariant(valueToNodeKinds.length === 2);
    return Maybe.of(
      `"@id": ${variables.value}.termType === "${nodeKinds[0]}" ? ${valueToNodeKinds[0]} : ${valueToNodeKinds[1]}`,
    );
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
