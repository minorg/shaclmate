import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class OptionType extends Type {
  override readonly discriminatorProperty: Maybe<Type.DiscriminatorProperty> =
    Maybe.empty();
  readonly itemType: Type;
  readonly kind = "OptionType";
  readonly typeof = "object";

  constructor({
    itemType,
    ...superParameters
  }: ConstructorParameters<typeof Type>[0] & { itemType: Type }) {
    super(superParameters);
    this.itemType = itemType;
  }

  @Memoize()
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

  @Memoize()
  override get equalsFunction(): string {
    return `((left, right) => ${syntheticNamePrefix}maybeEquals(left, right, ${this.itemType.equalsFunction}))`;
  }

  override get graphqlName(): string {
    return this.itemType.graphqlName; // Which is nullable by default
  }

  @Memoize()
  override get jsonName(): string {
    return `(${this.itemType.jsonName}) | undefined`;
  }

  @Memoize()
  override get jsonPropertySignature() {
    return {
      hasQuestionToken: true,
      name: this.itemType.jsonName,
    };
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `purify.Maybe<${this.itemType.name}>`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    const expression = `purify.Maybe.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "item" },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : `${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    return `${this.itemType.fromRdfExpression(parameters)}.map(value => purify.Maybe.of(value)).chainLeft(error => error instanceof rdfjsResource.Resource.MissingValueError ? purify.Right(purify.Maybe.empty()) : purify.Left(error))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    return `${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.value}.ifJust((value${depth}) => { ${this.itemType
        .hashStatements({
          depth: depth + 1,
          variables: {
            hasher: variables.hasher,
            value: `value${depth}`,
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

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): readonly string[] {
    const snippetDeclarations: string[] = this.itemType
      .snippetDeclarations(parameters)
      .concat();
    if (parameters.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.maybeEquals);
    }
    return snippetDeclarations;
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return this.itemType.sparqlConstructTemplateTriples(parameters);
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object": {
        const patterns = super.sparqlWherePatterns(parameters);
        if (patterns.length === 0) {
          return [];
        }
        return [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "subject": {
        return this.itemType.sparqlWherePatterns(parameters);
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: "value" },
    });
    if (itemTypeToRdfExpression === "value") {
      return variables.value;
    }
    return `${variables.value}.map((value) => ${itemTypeToRdfExpression})`;
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return [...this.itemType.useImports(parameters), Import.PURIFY];
  }
}
