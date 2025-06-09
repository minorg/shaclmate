import type { Import } from "generators/ts/Import.js";
import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { Property } from "./Property.js";

export class TypeDiscriminatorProperty extends Property<TypeDiscriminatorProperty.Type> {
  override readonly equalsFunction = "$strictEquals";
  override readonly mutable = false;
  readonly value: string;
  private readonly abstract: boolean;
  private readonly override: boolean;

  constructor({
    abstract,
    override,
    type,
    value,
    ...superParameters
  }: {
    abstract: boolean;
    override: boolean;
    type: TypeDiscriminatorProperty.Type;
    value: string;
  } & ConstructorParameters<typeof Property>[0]) {
    super({ ...superParameters, type });
    invariant(this.visibility === "public");
    this.abstract = abstract;
    this.override = override;
    this.value = value;
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.empty();
  }

  override get classPropertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return Maybe.of({
      // Work around a ts-morph bug that puts the override keyword before the abstract keyword
      isAbstract: this.abstract && this.override ? undefined : this.abstract,
      hasOverrideKeyword:
        this.abstract && this.override ? undefined : this.override,
      initializer: !this.abstract ? `"${this.value}"` : undefined,
      isReadonly: true,
      leadingTrivia:
        this.abstract && this.override ? "abstract override " : undefined,
      name: this.name,
      type:
        !this.abstract && this.type.name === `"${this.value}"`
          ? undefined
          : this.type.name,
    });
  }

  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.empty();
  }

  override get declarationImports(): readonly Import[] {
    return [];
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
      name: this.name,
      type: this.type.name,
    });
  }

  override get snippetDeclarations(): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (this.objectType.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.strictEquals);
    }
    return snippetDeclarations;
  }

  override classConstructorStatements(): readonly string[] {
    return [];
  }

  override fromJsonStatements(): readonly string[] {
    return this.fromRdfStatements();
  }

  override fromRdfStatements(): readonly string[] {
    return !this.abstract && this.objectType.declarationType === "interface"
      ? [`const ${this.name} = "${this.value}" as const`]
      : [];
  }

  override hashStatements({
    variables,
  }: Parameters<
    Property<TypeDiscriminatorProperty>["hashStatements"]
  >[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override interfaceConstructorStatements(): readonly string[] {
    return !this.abstract
      ? [`const ${this.name} = "${this.value}" as const`]
      : [];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    Property<TypeDiscriminatorProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    const scope = `\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return Maybe.of(
      `{ rule: { condition: { schema: { const: "${this.value}" }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<
    Property<TypeDiscriminatorProperty.Type>["jsonZodSchema"]
  >[0]): ReturnType<Property<TypeDiscriminatorProperty.Type>["jsonZodSchema"]> {
    return Maybe.of({
      key: this.name,
      schema:
        this.type.values.length > 1
          ? `${variables.zod}.enum(${JSON.stringify(this.type.values)})`
          : `${variables.zod}.literal("${this.type.values[0]}")`,
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
    Property<TypeDiscriminatorProperty.Type>["toJsonObjectMember"]
  >[0]): Maybe<string> {
    return Maybe.of(`${this.name}: ${variables.value}`);
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}

export namespace TypeDiscriminatorProperty {
  export class Type {
    readonly mutable: boolean;
    readonly values: readonly string[];

    constructor({
      mutable,
      values,
    }: {
      mutable: boolean;
      values: readonly string[];
    }) {
      this.mutable = mutable;
      this.values = values;
    }

    @Memoize()
    get name(): string {
      return this.values.map((name) => `"${name}"`).join(" | ");
    }
  }
}
