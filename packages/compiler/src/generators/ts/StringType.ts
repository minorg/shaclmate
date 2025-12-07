import { Memoize } from "typescript-memoize";

import { NonEmptyList } from "purify-ts";
import type { AbstractType } from "./AbstractType.js";
import { PrimitiveType } from "./PrimitiveType.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export class StringType extends PrimitiveType<string> {
  readonly kind = "StringType";
  override readonly typeofs = NonEmptyList(["string" as const]);

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
    return "string";
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    PrimitiveType<string>["fromRdfExpressionChain"]
  >[0]): ReturnType<PrimitiveType<string>["fromRdfExpressionChain"]> {
    const inChain =
      this.primitiveIn.length > 0
        ? `.chain(string_ => { switch (string_) { ${this.primitiveIn.map((value) => `case "${value}":`).join(" ")} return purify.Either.of<Error, ${this.name}>(string_); default: return purify.Left<Error, ${this.name}>(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "value.toTerm()", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })`
        : "";

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: `chain(values => values.chainMap(value => value.toString()${inChain}))`,
    };
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): ReturnType<
    AbstractType["jsonZodSchema"]
  > {
    switch (this.primitiveIn.length) {
      case 0:
        return `${variables.zod}.string()`;
      case 1:
        return `${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return `${variables.zod}.enum(${JSON.stringify(this.primitiveIn)})`;
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<PrimitiveType<string>["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    return super.sparqlWherePatterns({
      ...parameters,
      ignoreLiteralLanguage: false,
    });
  }

  override toRdfExpression({
    variables,
  }: Parameters<PrimitiveType<string>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `(${variables.value} !== "${defaultValue}" ? [${variables.value}] : [])`,
      )
      .orDefault(`[${variables.value}]`);
  }
}
