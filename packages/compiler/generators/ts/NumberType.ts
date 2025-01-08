import { Memoize } from "typescript-memoize";
import { PrimitiveType } from "./PrimitiveType.js";
import type { Type } from "./Type.js";

export class NumberType extends PrimitiveType<number> {
  readonly kind = "NumberType";

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

  override get jsonName(): string {
    return "number";
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return this.primitiveIn.map((value) => value.toString()).join(" | ");
    }
    return "number";
  }

  override propertyFromRdfResourceValueExpression({
    variables,
  }: Parameters<
    PrimitiveType<number>["propertyFromRdfResourceValueExpression"]
  >[0]): string {
    let expression = `${variables.resourceValue}.toNumber()`;
    if (this.primitiveIn.length > 0) {
      expression = `${expression}.chain(value => { switch (value) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return purify.Either.of(value); default: return purify.Left(new rdfjsResource.Resource.MistypedValueError({ actualValue: rdfLiteral.toRdf(value), expectedValueType: ${JSON.stringify(this.name)}, focusResource: ${variables.resource}, predicate: ${variables.predicate} })); } })`;
    }
    return expression;
  }

  override propertyToRdfExpression({
    variables,
  }: Parameters<PrimitiveType<string>["propertyToRdfExpression"]>[0]): string {
    return this.primitiveDefaultValue
      .map(
        (defaultValue) =>
          `${variables.value} !== ${defaultValue} ? ${variables.value} : undefined`,
      )
      .orDefault(variables.value);
  }
}
