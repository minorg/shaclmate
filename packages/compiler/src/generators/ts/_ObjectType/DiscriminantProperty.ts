import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { type Code, code, literalOf } from "../ts-poet-wrapper.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class DiscriminantProperty extends AbstractProperty<DiscriminantProperty.Type> {
  override readonly constructorParameter: Maybe<Code> = Maybe.empty();
  override readonly declaration =
    code`readonly ${this.name}: ${this.type.expression};`;
  override readonly filterProperty: AbstractProperty<DiscriminantProperty.Type>["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: AbstractProperty<DiscriminantProperty.Type>["graphqlField"] =
    Maybe.empty();
  override readonly hashFunctionParameter =
    code`readonly ${this.name}?: ${this.type.expression};`;
  readonly jsonName = "@type";
  override readonly jsonSignature = Maybe.of(
    code`readonly "${this.jsonName}": ${this.type.expression}`,
  );
  override readonly kind = "Discriminant";
  override readonly mutable = false;
  override readonly recursive = false;
  override readonly schema: Maybe<Code> = Maybe.empty();
  override readonly schemaType: Maybe<Code> = Maybe.empty();
  readonly value: string;

  constructor({
    value,
    ...superParameters
  }: {
    value: string;
  } & Omit<ConstructorParameters<typeof AbstractProperty>[0], "type">) {
    super({ ...superParameters, type: new DiscriminantProperty.Type(value) });
    this.value = value;
  }

  @Memoize()
  override get jsonSchema(): AbstractProperty<DiscriminantProperty.Type>["jsonSchema"] {
    return Maybe.of({
      key: this.jsonName,
      schema: code`${this.reusables.imports.z}.literal(${literalOf(this.value)})`,
    });
  }

  @Memoize()
  get values(): readonly string[] {
    return [this.value];
  }

  private get constValue(): Code {
    return code`${literalOf(this.value)} as const`;
  }

  override constructorInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromJsonInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromRdfResourceValuesInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`if (${variables.value}) { ${variables.hasher}.update(${variables.value}); }`,
    ];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    const scope = code`\`\${${variables.scopePrefix}}/properties/${this.jsonName}\``;
    return Maybe.of(
      code`{ rule: { condition: { schema: { const: ${this.constValue} }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
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

  override toJsonInitializer({
    variables,
  }: Parameters<
    AbstractProperty<DiscriminantProperty.Type>["toJsonInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(code`"${this.jsonName}": ${variables.value}`);
  }

  override toRdfRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }
}

export namespace DiscriminantProperty {
  export class Type {
    readonly filterFunction = code`nonextant`;
    readonly mutable = false;

    constructor(readonly value: string) {}

    @Memoize()
    get expression(): Code {
      return code`${literalOf(this.value)}`;
    }

    @Memoize()
    get schema(): Code {
      throw new Error("should never be called");
    }
  }
}
