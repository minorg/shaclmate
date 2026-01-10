import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type {
  GetAccessorDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  PropertySignatureStructure,
} from "ts-morph";
import { Memoize } from "typescript-memoize";

import type { Import } from "../Import.js";
import { sharedSnippetDeclarations } from "../sharedSnippetDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Property } from "./Property.js";

export class TypeDiscriminantProperty extends Property<TypeDiscriminantProperty.Type> {
  override readonly constructorParametersPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  > = Maybe.empty();
  override readonly declarationImports: readonly Import[] = [];
  override readonly equalsFunction = Maybe.of(
    `${syntheticNamePrefix}strictEquals`,
  );
  override readonly filterProperty: Property<TypeDiscriminantProperty.Type>["filterProperty"] =
    Maybe.empty();
  override readonly getAccessorDeclaration: Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > = Maybe.empty();
  override readonly graphqlField: Property<TypeDiscriminantProperty.Type>["graphqlField"] =
    Maybe.empty();
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    type,
    ...superParameters
  }: {
    type: TypeDiscriminantProperty.Type;
  } & ConstructorParameters<typeof Property>[0]) {
    super({ ...superParameters, type });
    invariant(this.visibility === "public");
  }

  private get abstract(): boolean {
    return this.objectType.abstract;
  }

  private get initializer(): string {
    return this.objectType.discriminantValue;
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

  private get override(): boolean {
    return this.objectType.parentObjectTypes.length > 0;
  }

  override constructorStatements(): readonly string[] {
    switch (this.objectType.declarationType) {
      case "class":
        return [];
      case "interface":
        if (this.abstract) {
          return [];
        }
        return [`const ${this.name} = "${this.initializer}" as const`];
    }
  }

  override fromJsonStatements(): readonly string[] {
    return this.fromRdfStatements();
  }

  override fromRdfStatements(): readonly string[] {
    return !this.abstract && this.objectType.declarationType === "interface"
      ? [`const ${this.name} = "${this.initializer}" as const`]
      : [];
  }

  override hashStatements({
    variables,
  }: Parameters<
    Property<TypeDiscriminantProperty>["hashStatements"]
  >[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    Property<TypeDiscriminantProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<string> {
    const scope = `\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return Maybe.of(
      `{ rule: { condition: { schema: { const: "${this.initializer}" }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
    );
  }

  override jsonZodSchema({
    variables,
  }: Parameters<
    Property<TypeDiscriminantProperty.Type>["jsonZodSchema"]
  >[0]): ReturnType<Property<TypeDiscriminantProperty.Type>["jsonZodSchema"]> {
    return Maybe.of({
      key: this.name,
      schema:
        this.type.values.length > 1
          ? `${variables.zod}.enum(${JSON.stringify(this.type.values)})`
          : `${variables.zod}.literal("${this.type.values[0]}")`,
    });
  }

  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return Maybe.of({
      // Work around a ts-morph bug that puts the override keyword before the abstract keyword
      isAbstract: this.abstract && this.override ? undefined : this.abstract,
      hasOverrideKeyword:
        this.abstract && this.override ? undefined : this.override,
      initializer: !this.abstract ? `"${this.initializer}"` : undefined,
      isReadonly: true,
      leadingTrivia:
        this.abstract && this.override ? "abstract override " : undefined,
      name: this.name,
      type:
        !this.abstract && this.type.name === `"${this.initializer}"`
          ? undefined
          : this.type.name,
    });
  }

  override get propertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  override snippetDeclarations(): Readonly<Record<string, string>> {
    if (this.objectType.features.has("equals")) {
      return sharedSnippetDeclarations.strictEquals;
    }
    return {};
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
    Property<TypeDiscriminantProperty.Type>["toJsonObjectMember"]
  >[0]): Maybe<string> {
    return Maybe.of(`${this.name}: ${variables.value}`);
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}

export namespace TypeDiscriminantProperty {
  export class Type {
    readonly mutable: boolean;
    readonly descendantValues: readonly string[];
    readonly ownValues: readonly string[];

    constructor({
      descendantValues,
      mutable,
      ownValues,
    }: {
      descendantValues: readonly string[];
      mutable: boolean;
      ownValues: readonly string[];
    }) {
      this.descendantValues = descendantValues;
      this.mutable = mutable;
      this.ownValues = ownValues;
    }

    @Memoize()
    get name(): string {
      return this.values.map((name) => `"${name}"`).join(" | ");
    }

    @Memoize()
    get values() {
      return this.ownValues.concat(this.descendantValues);
    }
  }
}
