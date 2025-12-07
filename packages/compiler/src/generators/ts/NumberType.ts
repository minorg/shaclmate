import { Memoize } from "typescript-memoize";

import { NonEmptyList } from "purify-ts";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

export abstract class NumberType extends AbstractPrimitiveType<number> {
  readonly kind = "NumberType";
  override readonly typeofs = NonEmptyList(["number" as const]);

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "number"`,
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

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => value.toString()).join(" | ");
    }
    return "number";
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    switch (this.primitiveIn.length) {
      case 0:
        return `${variables.zod}.number()`;
      case 1:
        return `${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return `${variables.zod}.union([${this.primitiveIn.map((value) => `${variables.zod}.literal(${value})`).join(", ")}])`;
    }
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<TermType["fromRdfExpressionChain"]>[0]): ReturnType<
    TermType["fromRdfExpressionChain"]
  > {
    let fromRdfResourceValueExpression = "value.toNumber()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(value => { switch (value) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return purify.Either.of${eitherTypeParameters}(value); default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "rdfLiteral.toRdf(value)", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: `chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `(${variables.value} !== ${defaultValue} ? [${variables.value}] : [])`,
      )
      .orDefault(`[${variables.value}]`);
  }
}
