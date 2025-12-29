import { Memoize } from "typescript-memoize";

import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class OptionType<ItemTypeT extends AbstractType> extends AbstractType {
  override readonly discriminantProperty: Maybe<Type.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly itemType: ItemTypeT;
  readonly kind = "OptionType";
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    itemType,
    ...superParameters
  }: { itemType: ItemTypeT } & ConstructorParameters<typeof AbstractType>[0]) {
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

    // Unless itemType is a list, it should only have a conversion from undefined if it has a
    // defaultValue. Per the CST->AST transformation logic, a type with a defaultValue
    // should never be wrapped in an OptionType.
    invariant(
      !conversions.some(
        (conversion) => conversion.sourceTypeName === "undefined",
      ) || this.itemType instanceof AbstractCollectionType,
    );
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

  @Memoize()
  override get graphqlName(): Type.GraphqlName {
    invariant(!this.itemType.graphqlName.nullable);
    return new Type.GraphqlName(this.itemType.graphqlName.toString(), {
      nullable: true,
    });
  }

  @Memoize()
  override jsonName(
    parameters?: Parameters<AbstractType["jsonName"]>[0],
  ): Type.JsonName {
    const itemTypeJsonName = this.itemType.jsonName(parameters);
    invariant(!itemTypeJsonName.optional);
    return new Type.JsonName(itemTypeJsonName.toString(), {
      optional: true,
    });
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
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): string {
    const expression = `purify.Maybe.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "item" },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : `${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<AbstractType["fromRdfExpression"]>[0],
  ): string {
    const { variables } = parameters;
    return `${this.itemType.fromRdfExpression(parameters)}.map(values => values.length > 0 ? values.map(value => purify.Maybe.of(value)) : rdfjsResource.Resource.Values.fromValue<purify.Maybe<${this.itemType.name}>>({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: purify.Maybe.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): string {
    return `${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
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
    parameters: Parameters<AbstractType["jsonUiSchemaElement"]>[0],
  ): ReturnType<AbstractType["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): ReturnType<AbstractType["jsonZodSchema"]> {
    return `${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
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
    parameters: Parameters<AbstractType["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object":
        return super.sparqlConstructTemplateTriples(parameters);
      case "subject":
        return this.itemType.sparqlConstructTemplateTriples(parameters);
    }
  }

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    switch (parameters.context) {
      case "object": {
        const patterns = this.itemType.sparqlWherePatterns(parameters);
        if (patterns.length === 0) {
          return [];
        }
        return [`{ patterns: [${patterns.join(", ")}], type: "optional" }`];
      }
      case "subject": {
        throw new Error("should never be called");
        // return this.itemType.sparqlWherePatterns(parameters);
      }
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): string {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: "value" },
    });
    let toRdfExpression = `${variables.value}.toList()`;
    if (itemTypeToRdfExpression !== "[value]") {
      toRdfExpression = `${toRdfExpression}.flatMap((value) => ${itemTypeToRdfExpression})`;
    }
    return toRdfExpression;
  }

  override useImports(
    parameters: Parameters<AbstractType["useImports"]>[0],
  ): readonly Import[] {
    return [...this.itemType.useImports(parameters), Import.PURIFY];
  }
}
