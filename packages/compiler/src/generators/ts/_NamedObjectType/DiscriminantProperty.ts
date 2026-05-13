import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { removeUndefined } from "../removeUndefined.js";
import { arrayOf, type Code, code, literalOf } from "../ts-poet-wrapper.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class DiscriminantProperty extends AbstractProperty<DiscriminantProperty.Type> {
  override readonly constructorParametersSignature: Maybe<Code> = Maybe.empty();
  override readonly filterProperty: AbstractProperty<DiscriminantProperty.Type>["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: AbstractProperty<DiscriminantProperty.Type>["graphqlField"] =
    Maybe.empty();
  override readonly kind = "DiscriminantProperty";
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    type,
    ...superParameters
  }: {
    type: DiscriminantProperty.Type;
  } & ConstructorParameters<typeof AbstractProperty>[0]) {
    super({ ...superParameters, type });
  }

  override get declaration(): Code {
    return code`readonly ${this.name}: ${this.type.name};`;
  }

  @Memoize()
  override get jsonSchema(): AbstractProperty<DiscriminantProperty.Type>["jsonSchema"] {
    return Maybe.of({
      key: this.name,
      schema:
        this.type.values.length > 1
          ? code`${this.reusables.imports.z}.enum(${arrayOf(...this.type.values)})`
          : code`${this.reusables.imports.z}.literal(${literalOf(this.type.values[0])})`,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    return Maybe.of(code`readonly ${this.name}: ${this.type.name}`);
  }

  private get initializer(): Code {
    return code`${literalOf(this.namedObjectType.discriminantValue)} as const`;
  }

  override constructorStatements(): readonly Code[] {
    return [code`const ${this.name} = ${this.initializer};`];
  }

  override fromJsonStatements(): readonly Code[] {
    return [];
  }

  override fromRdfResourceValuesExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["hashStatements"]
  >[0]): readonly Code[] {
    if (this.namedObjectType.parentObjectTypes.length > 0) {
      return [];
    }

    return [code`${variables.hasher}.update(${variables.value});`];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    if (this.namedObjectType.parentObjectTypes.length > 0) {
      return Maybe.empty();
    }

    const scope = code`\`\${${variables.scopePrefix}}/properties/${this.name}\``;
    return Maybe.of(
      code`{ rule: { condition: { schema: { const: ${this.initializer} }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
    );
  }

  override sparqlConstructTriplesExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatternsExpression(): ReturnType<
    AbstractProperty<DiscriminantProperty.Type>["sparqlWherePatternsExpression"]
  > {
    return Maybe.empty();
  }

  override toJsonObjectMemberExpression({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["toJsonObjectMemberExpression"]
  >[0]): Maybe<Code> {
    return Maybe.of(code`${this.name}: ${variables.value}`);
  }

  override toRdfRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringExpression(): Maybe<Code> {
    return Maybe.empty();
  }
}

export namespace DiscriminantProperty {
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
    get name(): string {
      return `${this.values.map((name) => `"${name}"`).join(" | ")}`;
    }

    @Memoize()
    get schema(): Code {
      return code`${removeUndefined({
        descendantValues:
          this.descendantValues.length > 0 ? this.descendantValues : undefined,
        kind: code`${literalOf("TypeDiscriminant")} as const`,
        ownValues: this.ownValues.length > 0 ? this.ownValues : undefined,
      })}`;
    }

    @Memoize()
    get values() {
      return this.ownValues.concat(this.descendantValues);
    }
  }
}
