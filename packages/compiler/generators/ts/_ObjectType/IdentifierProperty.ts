import { NodeKind } from "@shaclmate/shacl-ast";
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
  TsObjectDeclarationType,
} from "../../../enums/index.js";
import type { IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import { Property } from "./Property.js";

export class IdentifierProperty extends Property<IdentifierType> {
  readonly abstract: boolean;
  readonly equalsFunction = "purifyHelpers.Equatable.booleanEquals";
  readonly mutable = false;
  private readonly classDeclarationVisibility: Maybe<PropertyVisibility>;
  private readonly lazyObjectTypeMutable: () => boolean;
  private readonly mintingStrategy: Maybe<MintingStrategy>;
  private readonly objectTypeDeclarationType: TsObjectDeclarationType;
  private readonly override: boolean;

  constructor({
    abstract,
    classDeclarationVisibility,
    lazyObjectTypeMutable,
    mintingStrategy,
    objectTypeDeclarationType,
    override,
    ...superParameters
  }: {
    abstract: boolean;
    classDeclarationVisibility: Maybe<PropertyVisibility>;
    lazyObjectTypeMutable: () => boolean;
    mintingStrategy: Maybe<MintingStrategy>;
    objectTypeDeclarationType: TsObjectDeclarationType;
    override: boolean;
    type: IdentifierType;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    invariant(this.visibility === "public");
    this.abstract = abstract;
    this.classDeclarationVisibility = classDeclarationVisibility;
    this.mintingStrategy = mintingStrategy;
    this.objectTypeDeclarationType = objectTypeDeclarationType;
    this.lazyObjectTypeMutable = lazyObjectTypeMutable;
    this.override = override;
  }

  override get classConstructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    if (this.abstract) {
      return Maybe.empty();
    }

    // Identifier is always optional
    return Maybe.of({
      hasQuestionToken: true,
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    if (this.abstract) {
      return Maybe.empty();
    }

    let mintIdentifier: string;
    if (this.type.nodeKinds.has(NodeKind.IRI)) {
      switch (this.mintingStrategy.orDefault("sha256")) {
        case "sha256":
          mintIdentifier =
            "dataFactory.namedNode(`urn:shaclmate:object:${this.type}:${this.hash(sha256.create())}`)";
          break;
        case "uuidv4":
          mintIdentifier =
            "dataFactory.namedNode(`urn:shaclmate:object:${this.type}:${uuid.v4()}`)";
          break;
      }
    } else {
      invariant(this.type.nodeKinds.has(NodeKind.BLANK_NODE));
      mintIdentifier = "dataFactory.blankNode()";
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

    if (this.classDeclarationVisibility.isJust()) {
      // Mutable _identifier that will be lazily initialized by the getter
      return Maybe.of({
        name: `_${this.name}`,
        scope: this.classDeclarationVisibility
          .map(Property.visibilityToScope)
          .unsafeCoerce(),
        type: `${this.type.name} | undefined`,
      });
    }

    return Maybe.empty();
  }

  override get declarationImports(): readonly Import[] {
    if (this.objectTypeDeclarationType !== "class") {
      return [];
    }
    if (!this.type.nodeKinds.has(NodeKind.IRI)) {
      return [];
    }

    switch (this.mintingStrategy.orDefault("sha256")) {
      case "sha256":
        return [Import.SHA256];
      case "uuidv4":
        return [Import.UUID];
      default:
        throw new Error("not implemented");
    }
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

  override classConstructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["classConstructorStatements"]
  >[0]): readonly string[] {
    if (this.classDeclarationVisibility.isJust()) {
      return [`this._${this.name} = ${variables.parameter};`];
    }
    return [];
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

  override sparqlGraphPatternExpression(): Maybe<string> {
    return Maybe.empty();
  }

  override toJsonObjectMember({
    variables,
  }: Parameters<Property<IdentifierType>["toJsonObjectMember"]>[0]): string {
    return `"@id": ${variables.value}.value`;
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
