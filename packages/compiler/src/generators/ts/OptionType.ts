import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { Sparql } from "./Sparql.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

export class OptionType<ItemTypeT extends Type> extends AbstractType {
  override readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty> =
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
  override get conversions(): readonly AbstractType.Conversion[] {
    const conversions: AbstractType.Conversion[] = [];
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
  override get graphqlType(): AbstractType.GraphqlType {
    invariant(!this.itemType.graphqlType.nullable);
    return new AbstractType.GraphqlType(this.itemType.graphqlType.name, {
      nullable: true,
    });
  }

  override get mutable(): boolean {
    return this.itemType.mutable;
  }

  @Memoize()
  override get name(): string {
    return `purify.Maybe<${this.itemType.name}>`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      item: this.itemType.schema,
    };
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

  @Memoize()
  override jsonType(
    parameters?: Parameters<AbstractType["jsonType"]>[0],
  ): AbstractType.JsonType {
    const itemTypeJsonType = this.itemType.jsonType(parameters);
    invariant(!itemTypeJsonType.optional);
    return new AbstractType.JsonType(itemTypeJsonType.name, {
      optional: true,
    });
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
  ): Readonly<Record<string, string>> {
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

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}MaybeFilter.sparqlWherePatterns`,
            `\
namespace ${syntheticNamePrefix}MaybeFilter {
  export function ${syntheticNamePrefix}sparqlWherePatterns<ItemFilterT>(filter: ${syntheticNamePrefix}MaybeFilter<ItemFilterT> | undefined, itemSparqlWherePatterns: (itemFilter: ItemFilterT | undefined) => readonly sparqljs.Pattern[]): readonly sparqljs.Pattern[] {  
    if (filter === null) {
      return [{ expression: { args: itemSparqlWherePatterns(undefined).concat(), operator: "notexists", type: "operation" }, type: "filter" }]
    }

    return [{ patterns: itemSparqlWherePatterns(filter).concat(), type: "optional" }];
  }
}`,
          )
        : {},
    );
  }

  override sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ): readonly (Sparql.Triple | string)[] {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ): readonly Sparql.Pattern[] {
    const { variables } = parameters;
    return variables.filter
      .map((filterVariable) => {
        const itemPatterns = this.itemType.sparqlWherePatterns({
          ...parameters,
          variables: {
            ...variables,
            filter: Maybe.of("itemFilter"),
          },
        });

        return [
          {
            patterns: `${syntheticNamePrefix}MaybeFilter.${syntheticNamePrefix}sparqlWherePatterns(${filterVariable}, (itemFilter) => [${itemPatterns.map(Sparql.Pattern.stringify).join(", ")}])`,
            type: "opaque-block",
          },
        ] as readonly Sparql.Pattern[];
      })
      .orDefaultLazy(() => [
        {
          patterns: this.itemType.sparqlWherePatterns(parameters),
          type: "optional",
        },
      ]);
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
