import { Memoize } from "typescript-memoize";

import { PrimitiveType } from "./PrimitiveType.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export class BooleanType extends PrimitiveType<boolean> {
  readonly kind = "BooleanType";
  override readonly typeof = "boolean";

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "boolean"`,
        sourceTypeName: this.name,
      },
    ];
    this.primitiveDefaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => defaultValue.toString(),
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });
    return conversions;
  }

  override get graphqlName(): Type.GraphqlName {
    return new Type.GraphqlName("graphql.GraphQLBoolean");
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => value.toString()).join(" | ");
    }
    return this.typeof;
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    if (this.primitiveIn.length === 1) {
      return `${variables.zod}.literal(${this.primitiveIn[0]})`;
    }
    return `${variables.zod}.boolean()`;
  }

  override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    PrimitiveType<boolean>["fromRdfResourceValueExpression"]
  >[0]): string {
    let expression = `${variables.resourceValue}.toBoolean()`;
    if (this.primitiveIn.length === 1) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      expression = `${expression}.chain(value => value === ${this.primitiveIn[0]} ? purify.Either.of${eitherTypeParameters}(value) : purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedValueError(${objectInitializer({ actualValue: "rdfLiteral.toRdf(value)", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})))`;
    }
    return expression;
  }

  override toRdfExpression({
    variables,
  }: Parameters<PrimitiveType<string>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map((defaultValue) => {
        if (defaultValue) {
          // If the default is true, only serialize the value if it's false
          return `!${variables.value} ? false : undefined`;
        }
        // If the default is false, only serialize the value if it's true
        return `${variables.value} ? true : undefined`;
      })
      .orDefault(variables.value);
  }
}
