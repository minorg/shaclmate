import { Memoize } from "typescript-memoize";
import { PrimitiveType } from "./PrimitiveType.js";
import type { Type } from "./Type.js";

export class BooleanType extends PrimitiveType<boolean> {
  override readonly jsonName = "boolean";
  readonly kind = "BooleanType";

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

  @Memoize()
  override get name(): string {
    return this.primitiveIn
      .map((values) => values.map((value) => value.toString()).join(" | "))
      .orDefault("boolean");
  }

  override propertyFromRdfResourceValueExpression({
    variables,
  }: Parameters<
    PrimitiveType<boolean>["propertyFromRdfResourceValueExpression"]
  >[0]): string {
    let expression = `${variables.resourceValue}.toBoolean()`;
    this.primitiveIn.ifJust((in_) => {
      if (in_.length === 1) {
        expression = `${expression}.chain(value => value === ${in_[0]} ? purify.Either.of(value) : purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: rdfLiteral.toRdf(value), expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })))`;
      }
    });
    return expression;
  }

  override propertyToRdfExpression({
    variables,
  }: Parameters<PrimitiveType<string>["propertyToRdfExpression"]>[0]): string {
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
