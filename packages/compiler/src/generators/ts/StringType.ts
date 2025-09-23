import { Memoize } from "typescript-memoize";

import { PrimitiveType } from "./PrimitiveType.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export class StringType extends PrimitiveType<string> {
  readonly kind = "StringType";
  override readonly typeof = "string";

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
        sourceTypeName: this.name,
      },
    ];
    this.primitiveDefaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => `"${defaultValue}"`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });
    return conversions;
  }

  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphql.GraphQLString");
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => `"${value}"`).join(" | ");
    }
    return this.typeof;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    PrimitiveType<string>["fromRdfResourceValueExpression"]
  >[0]): string {
    let expression = `${variables.resourceValue}.toString()`;
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      expression = `${expression}.chain(value => { switch (value) { ${this.primitiveIn.map((value) => `case "${value}":`).join(" ")} return purify.Either.of${eitherTypeParameters}(value); default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: "rdfLiteral.toRdf(value)", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })`;
    }
    return expression;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    switch (this.primitiveIn.length) {
      case 0:
        return `${variables.zod}.string()`;
      case 1:
        return `${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return `${variables.zod}.enum(${JSON.stringify(this.primitiveIn)})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<PrimitiveType<string>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `${variables.value} !== "${defaultValue}" ? ${variables.value} : undefined`,
      )
      .orDefault(variables.value);
  }
}
