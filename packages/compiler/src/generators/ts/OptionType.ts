import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class OptionType<
  ItemTypeT extends OptionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  readonly kind = "OptionType";
  override readonly typeofs = NonEmptyList(["object" as const]);

  @Memoize()
  override get conversions(): readonly AbstractContainerType.Conversion[] {
    const conversions: AbstractContainerType.Conversion[] = [];
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
  get filterFunction(): string {
    return `${syntheticNamePrefix}filterMaybe<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): string {
    return `${syntheticNamePrefix}MaybeFilter<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new AbstractContainerType.GraphqlType(
      this.itemType.graphqlType.name,
      {
        nullable: true,
      },
    );
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `purify.Maybe<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): string {
    return `${syntheticNamePrefix}MaybeSchema<${this.itemType.schemaType}>`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): string {
    const expression = `purify.Maybe.fromNullable(${variables.value})`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: "item" },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : `${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["fromRdfExpression"]
    >[0],
  ): string {
    const { variables } = parameters;
    return `${this.itemType.fromRdfExpression(parameters)}.map(values => values.length > 0 ? values.map(value => purify.Maybe.of(value)) : rdfjsResource.Resource.Values.fromValue<purify.Maybe<${this.itemType.name}>>({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: purify.Maybe.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): string {
    return `${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["hashStatements"]
  >[0]): readonly string[] {
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

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractContainerType<ItemTypeT>["jsonType"]>[0],
  ): AbstractContainerType.JsonType {
    const itemTypeJsonType = this.itemType.jsonType(parameters);
    invariant(!itemTypeJsonType.optional);
    return new AbstractContainerType.JsonType(itemTypeJsonType.name, {
      optional: true,
    });
  }

  override jsonUiSchemaElement(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonUiSchemaElement"]
    >[0],
  ): ReturnType<AbstractContainerType<ItemTypeT>["jsonUiSchemaElement"]> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonZodSchema"]
    >[0],
  ): ReturnType<AbstractContainerType<ItemTypeT>["jsonZodSchema"]> {
    return `${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      this.itemType.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}filterMaybe`,
        `\
function ${syntheticNamePrefix}filterMaybe<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${syntheticNamePrefix}MaybeFilter<ItemFilterT>, value: purify.Maybe<ItemT>): boolean => {
    if (filter !== null) {
      if (value.isNothing()) {
        return false;
      }

      if (!filterItem(filter, value.extract()!)) {
        return false;
      }
    } else {
      if (value.isJust()) {
        return false;
      }
    }

    return true;
  }
}`,
      ),

      parameters.features.has("equals")
        ? singleEntryRecord(
            `${syntheticNamePrefix}maybeEquals`,
            `\
function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: purify.Maybe<T>,
  rightMaybe: purify.Maybe<T>,
  valueEquals: (left: T, right: T) => boolean | ${syntheticNamePrefix}EqualsResult,
): ${syntheticNamePrefix}EqualsResult {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return purify.Left({
      left: leftMaybe.unsafeCoerce(),
      type: "RightNull",
    });
  }

  if (rightMaybe.isJust()) {
    return purify.Left({
      right: rightMaybe.unsafeCoerce(),
      type: "LeftNull",
    });
  }

  return ${syntheticNamePrefix}EqualsResult.Equal;
}`,
          )
        : {},

      singleEntryRecord(
        `${syntheticNamePrefix}MaybeFilter`,
        `\
type ${syntheticNamePrefix}MaybeFilter<ItemFilterT> = ItemFilterT | null;`,
      ),

      singleEntryRecord(
        `${syntheticNamePrefix}MaybeSchema`,
        `type ${syntheticNamePrefix}MaybeSchema<ItemSchemaT> = { readonly item: ItemSchemaT }`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(`${syntheticNamePrefix}maybeSparqlWherePatterns`, {
            code: `\
function ${syntheticNamePrefix}maybeSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${syntheticNamePrefix}SparqlWherePatternsFunction<ItemFilterT, ItemSchemaT>): ${syntheticNamePrefix}SparqlWherePatternsFunction<${syntheticNamePrefix}MaybeFilter<ItemFilterT>, ${syntheticNamePrefix}MaybeSchema<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => {
    if (typeof filter === "undefined") {
      // Treat the item's patterns as optional
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${syntheticNamePrefix}liftSparqlPatterns(itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item }));
      return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
    }
      
    if (filter === null) {
      // Use FILTER NOT EXISTS around the item's patterns
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${syntheticNamePrefix}liftSparqlPatterns(itemSparqlWherePatternsFunction({ ...otherParameters, schema: schema.item }));
      return [{ expression: { args: itemSparqlWherePatterns.concat(), operator: "notexists", type: "operation" }, lift: true, type: "filter" }, ...liftSparqlPatterns]
    }

    // Treat the item as required.
    return itemSparqlWherePatternsFunction({ ...otherParameters, filter, schema: schema.item });
  }
}`,
            dependencies: {
              ...sharedSnippetDeclarations.liftSparqlPatterns,
              ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
            },
          })
        : {},
    );
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): readonly (AbstractContainerType.SparqlConstructTriple | string)[] {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): string {
    return `${syntheticNamePrefix}maybeSparqlWherePatterns<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toJsonExpression"]
  >[0]): string {
    return `${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: "item" } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toRdfExpression"]
  >[0]): string {
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
    parameters: Parameters<AbstractContainerType<ItemTypeT>["useImports"]>[0],
  ): readonly Import[] {
    return [...this.itemType.useImports(parameters), Import.PURIFY];
  }
}

export namespace OptionType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}
