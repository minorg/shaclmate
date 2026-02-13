import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, literalOf } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { sharedImports } from "../sharedImports.js";
import { sharedSnippets } from "../sharedSnippets.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class TypeDiscriminantProperty extends AbstractProperty<TypeDiscriminantProperty.Type> {
  override readonly constructorParametersSignature: Maybe<Code> = Maybe.empty();
  override readonly equalsFunction = Maybe.of(
    code`${sharedSnippets.strictEquals}`,
  );
  override readonly filterProperty: AbstractProperty<TypeDiscriminantProperty.Type>["filterProperty"] =
    Maybe.empty();
  override readonly getAccessorDeclaration: Maybe<Code> = Maybe.empty();
  override readonly graphqlField: AbstractProperty<TypeDiscriminantProperty.Type>["graphqlField"] =
    Maybe.empty();
  readonly kind = "TypeDiscriminantProperty";
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    type,
    ...superParameters
  }: {
    type: TypeDiscriminantProperty.Type;
  } & ConstructorParameters<typeof AbstractProperty>[0]) {
    super({ ...superParameters, type });
    invariant(this.visibility === "public");
  }

  override get declaration(): Maybe<Code> {
    switch (this.objectType.declarationType) {
      case "class":
        return Maybe.of(
          code`${this.abstract ? "abstract " : ""}${this.override ? "override " : ""}readonly ${this.name}: ${this.type.name}${!this.abstract ? code` = ${this.initializer}` : ";"}`,
        );
      case "interface":
        return Maybe.of(code`readonly ${this.name}: ${this.type.name};`);
      default:
        this.objectType.declarationType satisfies never;
        throw new Error("should never reach this point");
    }
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    return Maybe.of(code`readonly ${this.name}: ${this.type.name}`);
  }

  @Memoize()
  override get jsonZodSchema(): AbstractProperty<TypeDiscriminantProperty.Type>["jsonZodSchema"] {
    return Maybe.of({
      key: this.name,
      schema:
        this.type.values.length > 1
          ? code`${sharedImports.z}.enum(${JSON.stringify(this.type.values)})`
          : code`${sharedImports.z}.literal("${this.type.values[0]}")`,
    });
  }

  private get abstract(): boolean {
    return this.objectType.abstract;
  }

  private get initializer(): Code {
    return code`${literalOf(this.objectType.discriminantValue)} as const`;
  }

  private get override(): boolean {
    return this.objectType.parentObjectTypes.length > 0;
  }

  override constructorStatements(): readonly Code[] {
    switch (this.objectType.declarationType) {
      case "class":
        return [];
      case "interface":
        if (this.abstract) {
          return [];
        }
        return [code`const ${this.name} = ${this.initializer};`];
    }
  }

  override fromJsonStatements(): readonly Code[] {
    return !this.abstract && this.objectType.declarationType === "interface"
      ? [code`const ${this.name} = ${this.initializer};`]
      : [];
  }

  override fromRdfExpression(): Maybe<Code> {
    return !this.abstract && this.objectType.declarationType === "interface"
      ? Maybe.of(
          code`${sharedImports.Either}.of<Error, ${this.objectType.discriminantValue}>(${this.initializer})`,
        )
      : Maybe.empty();
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<TypeDiscriminantProperty.Type>["hashStatements"]
  >[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value});`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<TypeDiscriminantProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    const scope = `\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return Maybe.of(
      code`{ rule: { condition: { schema: { const: ${this.initializer} }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
    );
  }

  override sparqlConstructTriples(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatterns(): ReturnType<
    AbstractProperty<TypeDiscriminantProperty.Type>["sparqlWherePatterns"]
  > {
    return Maybe.empty();
  }

  override toJsonObjectMemberExpression({
    variables,
  }: Parameters<
    AbstractProperty<TypeDiscriminantProperty.Type>["toJsonObjectMemberExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(code`${this.name}: ${variables.value}`);
  }

  override toRdfStatements(): readonly Code[] {
    return [];
  }
}

export namespace TypeDiscriminantProperty {
  export class Type {
    readonly filterFunction = code`nonextant`;
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
    get name(): Code {
      return code`${this.values.map((name) => `"${name}"`).join(" | ")}`;
    }

    @Memoize()
    get schema(): Code {
      return code`${{
        descendantValues:
          this.descendantValues.length > 0
            ? this.descendantValues.map((_) => JSON.stringify(_))
            : undefined,
        ownValues:
          this.ownValues.length > 0
            ? this.ownValues.map((_) => JSON.stringify(_))
            : undefined,
      }}`;
    }

    @Memoize()
    get values() {
      return this.ownValues.concat(this.descendantValues);
    }
  }
}
