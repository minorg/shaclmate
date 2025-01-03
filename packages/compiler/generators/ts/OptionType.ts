import { Memoize } from "typescript-memoize";
import { Import } from "./Import.js";
import { Type } from "./Type.js";

export class OptionType extends Type {
  readonly itemType: Type;
  readonly kind = "OptionType";

  constructor({
    itemType,
    ...superParameters
  }: ConstructorParameters<typeof Type>[0] & { itemType: Type }) {
    super(superParameters);
    this.itemType = itemType;
  }

  override get conversions(): readonly Type.Conversion[] {
    const conversions: Type.Conversion[] = [];
    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) => `purify.Maybe.isMaybe(${value})`,
      sourceTypeName: this.name,
    });
    for (const itemTypeConversion of this.itemType.conversions) {
      conversions.push({
        ...itemTypeConversion,
        conversionExpression: (value) =>
          `purify.Maybe.of(${itemTypeConversion.conversionExpression(value)})`,
      });
    }
    if (
      !conversions.some(
        (conversion) => conversion.sourceTypeName === "undefined",
      )
    ) {
      conversions.push({
        conversionExpression: () => "purify.Maybe.empty()",
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    }
    return conversions;
  }

  override get equalsFunction(): string {
    const itemTypeEqualsFunction = this.itemType.equalsFunction;
    if (itemTypeEqualsFunction === "purifyHelpers.Equatable.equals") {
      return "purifyHelpers.Equatable.maybeEquals";
    }
    if (itemTypeEqualsFunction === "purifyHelpers.Equatable.strictEquals") {
      return "purifyHelpers.Equatable.booleanEquals"; // Use Maybe.equals
    }
    return `(left, right) => purifyHelpers.Maybes.equals(left, right, ${itemTypeEqualsFunction})`;
  }

  override get jsonName(): string {
    return `(${this.itemType.jsonName}) | undefined`;
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `purify.Maybe<${this.itemType.name}>`;
  }

  override propertyChainSparqlGraphPatternExpression(
    parameters: Parameters<
      Type["propertyChainSparqlGraphPatternExpression"]
    >[0],
  ): ReturnType<Type["propertyChainSparqlGraphPatternExpression"]> {
    return this.itemType.propertyChainSparqlGraphPatternExpression(parameters);
  }

  override propertyFromRdfExpression(
    parameters: Parameters<Type["propertyFromRdfExpression"]>[0],
  ): string {
    return `purify.Either.of(${this.itemType.propertyFromRdfExpression(parameters)}.toMaybe())`;
  }

  override propertyHashStatements({
    depth,
    variables,
  }: Parameters<Type["propertyHashStatements"]>[0]): readonly string[] {
    return [
      `${variables.value}.ifJust((_value${depth}) => { ${this.itemType
        .propertyHashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `_value${depth}`,
          },
        })
        .join("\n")} })`,
    ];
  }

  override propertySparqlGraphPatternExpression(
    parameters: Parameters<Type["propertySparqlGraphPatternExpression"]>[0],
  ): Type.SparqlGraphPatternExpression {
    return new Type.SparqlGraphPatternExpression(
      `sparqlBuilder.GraphPattern.optional(${this.itemType.propertySparqlGraphPatternExpression(parameters).toSparqlGraphPatternExpression()})`,
    );
  }

  override propertyToJsonExpression({
    variables,
  }: Parameters<Type["propertyToJsonExpression"]>[0]): string {
    return `${variables.value}.map(_item => (${this.itemType.propertyToJsonExpression({ variables: { value: "_item" } })})).extract()`;
  }

  override propertyToRdfExpression({
    variables,
  }: Parameters<Type["propertyToRdfExpression"]>[0]): string {
    const itemTypeToRdfExpression = this.itemType.propertyToRdfExpression({
      variables: { ...variables, value: "_value" },
    });
    if (itemTypeToRdfExpression === "_value") {
      return variables.value;
    }
    return `${variables.value}.map((_value) => ${itemTypeToRdfExpression})`;
  }

  override get useImports(): readonly Import[] {
    return [...this.itemType.useImports, Import.PURIFY];
  }
}
