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

  override get useImports(): readonly Import[] {
    return [...this.itemType.useImports, Import.PURIFY];
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    const expression = `purify.Maybe.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "_item" },
    });
    return itemFromJsonExpression === "_item"
      ? expression
      : `${expression}.map(_item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    return `purify.Either.of(${this.itemType.fromRdfExpression(parameters)}.toMaybe())`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.value}.ifJust((_value${depth}) => { ${this.itemType
        .hashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `_value${depth}`,
          },
        })
        .join("\n")} })`,
    ];
  }

  override jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ): ReturnType<Type["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): ReturnType<Type["jsonZodSchema"]> {
    return `${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override propertyChainSparqlGraphPatternExpression(
    parameters: Parameters<
      Type["propertyChainSparqlGraphPatternExpression"]
    >[0],
  ): ReturnType<Type["propertyChainSparqlGraphPatternExpression"]> {
    return this.itemType.propertyChainSparqlGraphPatternExpression(parameters);
  }

  override propertySparqlGraphPatternExpression(
    parameters: Parameters<Type["propertySparqlGraphPatternExpression"]>[0],
  ): Type.SparqlGraphPatternExpression {
    return new Type.SparqlGraphPatternExpression(
      `sparqlBuilder.GraphPattern.optional(${this.itemType.propertySparqlGraphPatternExpression(parameters).toSparqlGraphPatternExpression()})`,
    );
  }

  override sparqlConstructTemplateTriples({
    context,
    variables,
  }: Parameters<Type["sparqlConstructTemplateTriples"]>[0]): readonly string[] {
    switch (context) {
      case "property":
        return super.sparqlConstructTemplateTriples({ context, variables });
      case "type":
        return this.itemType.sparqlConstructTemplateTriples({
          context,
          variables,
        });
    }
  }

  override sparqlWherePatterns({
    context,
    variables,
  }: Parameters<Type["sparqlWherePatterns"]>[0]): readonly string[] {
    switch (context) {
      case "property": {
        const patterns = super.sparqlWherePatterns({ context, variables });
        if (patterns.length === 0) {
          return [];
        }
        return [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "type": {
        return this.itemType.sparqlWherePatterns({ context, variables });
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(_item => (${this.itemType.toJsonExpression({ variables: { value: "_item" } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: "_value" },
    });
    if (itemTypeToRdfExpression === "_value") {
      return variables.value;
    }
    return `${variables.value}.map((_value) => ${itemTypeToRdfExpression})`;
  }
}
