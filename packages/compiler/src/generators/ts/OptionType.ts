import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, conditionalOutput, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractCollectionType } from "./AbstractCollectionType.js";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { codeEquals } from "./codeEquals.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
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
      sourceTypeCheckExpression: (value) =>
        code`${sharedImports.Maybe}.isMaybe(${value})`,
      sourceTypeName: this.name,
      sourceTypeof: "object",
    });
    for (const itemTypeConversion of this.itemType.conversions) {
      conversions.push({
        ...itemTypeConversion,
        conversionExpression: (value) =>
          code`${sharedImports.Maybe}.of(${itemTypeConversion.conversionExpression(value)})`,
      });
    }

    // Unless itemType is a list, it should only have a conversion from undefined if it has a
    // defaultValue. Per the CST->AST transformation logic, a type with a defaultValue
    // should never be wrapped in an OptionType.
    invariant(
      !conversions.some(
        (conversion) => conversion.sourceTypeof === "undefined",
      ) || this.itemType instanceof AbstractCollectionType,
    );
    if (
      !conversions.some((conversion) => conversion.sourceTypeof === "undefined")
    ) {
      conversions.push({
        conversionExpression: () => code`${sharedImports.Maybe}.empty()`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "undefined"`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${localSnippets.maybeEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${localSnippets.filterMaybe}<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${localSnippets.MaybeFilter}<${this.itemType.filterType}>`;
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
  override get name(): Code {
    return code`${sharedImports.Maybe}<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${localSnippets.MaybeSchema}<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${localSnippets.maybeSparqlWherePatterns}<${this.itemType.filterType}, ${this.itemType.schemaType}>(${this.itemType.sparqlWherePatternsFunction})`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    const expression = code`${sharedImports.Maybe}.fromNullable(${variables.value})`;
    const valueVariable = code`item`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: valueVariable },
    });
    return codeEquals(itemFromJsonExpression, valueVariable)
      ? expression
      : code`${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override fromRdfExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["fromRdfExpression"]
    >[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.itemType.fromRdfExpression(parameters)}.map(values => values.length > 0 ? values.map(value => ${sharedImports.Maybe}.of(value)) : ${sharedImports.Resource}.Values.fromValue<${sharedImports.Maybe}<${this.itemType.name}>>({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, value: ${sharedImports.Maybe}.empty() }))`;
  }

  override graphqlResolveExpression(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
    >[0],
  ): Code {
    return code`${this.itemType.graphqlResolveExpression(parameters)}.extractNullable()`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`${variables.value}.ifJust((value${depth}) => { ${joinCode(
        this.itemType
          .hashStatements({
            depth: depth + 1,
            variables: {
              hasher: variables.hasher,
              value: code`value${depth}`,
            },
          })
          .concat(),
      )} })`,
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
  ): Maybe<Code> {
    return this.itemType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonZodSchema"]
    >[0],
  ): Code {
    return code`${this.itemType.jsonZodSchema(parameters)}.optional()`;
  }

  override sparqlConstructTriples(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["sparqlConstructTriples"]
    >[0],
  ): Code {
    return this.itemType.sparqlConstructTriples(parameters);
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toJsonExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: code`item` } })})).extract()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractContainerType<ItemTypeT>["toRdfExpression"]>[0]): Code {
    const itemTypeToRdfExpression = this.itemType.toRdfExpression({
      variables: { ...variables, value: code`value` },
    });
    let toRdfExpression = code`${variables.value}.toList()`;
    if (!codeEquals(itemTypeToRdfExpression, code`[value]`)) {
      toRdfExpression = code`${toRdfExpression}.flatMap((value) => ${itemTypeToRdfExpression})`;
    }
    return toRdfExpression;
  }
}

namespace localSnippets {
  export const MaybeFilter = conditionalOutput(
    `${syntheticNamePrefix}MaybeFilter`,
    code`\
type ${syntheticNamePrefix}MaybeFilter<ItemFilterT> = ItemFilterT | null;`,
  );
  export const MaybeSchema = conditionalOutput(
    `${syntheticNamePrefix}MaybeSchema`,
    code`type ${syntheticNamePrefix}MaybeSchema<ItemSchemaT> = { readonly item: ItemSchemaT }`,
  );

  export const maybeEquals = conditionalOutput(
    `${syntheticNamePrefix}maybeEquals`,
    code`\
function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: ${sharedImports.Maybe}<T>,
  rightMaybe: ${sharedImports.Maybe}<T>,
  valueEquals: (left: T, right: T) => boolean | ${sharedSnippets.EqualsResult},
): ${sharedSnippets.EqualsResult} {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${sharedSnippets.EqualsResult}.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return ${sharedImports.Left}({
      left: leftMaybe.unsafeCoerce(),
      type: "RightNull",
    });
  }

  if (rightMaybe.isJust()) {
    return ${sharedImports.Left}({
      right: rightMaybe.unsafeCoerce(),
      type: "LeftNull",
    });
  }

  return ${sharedSnippets.EqualsResult}.Equal;
}`,
  );

  export const maybeSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}maybeSparqlWherePatterns`,
    code`\
function ${syntheticNamePrefix}maybeSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${sharedSnippets.SparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${sharedSnippets.SparqlWherePatternsFunction}<${MaybeFilter}<ItemFilterT>, ${MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => {
    if (typeof filter === "undefined") {
      // Treat the item's patterns as optional
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${sharedSnippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ filter, schema: schema.item, ...otherParameters }));
      return [{ patterns: itemSparqlWherePatterns.concat(), type: "optional" }, ...liftSparqlPatterns];
    }
      
    if (filter === null) {
      // Use FILTER NOT EXISTS around the item's patterns
      const [itemSparqlWherePatterns, liftSparqlPatterns] = ${sharedSnippets.liftSparqlPatterns}(itemSparqlWherePatternsFunction({ schema: schema.item, ...otherParameters }));
      return [{ expression: { args: itemSparqlWherePatterns.concat(), operator: "notexists", type: "operation" }, lift: true, type: "filter" }, ...liftSparqlPatterns]
    }

    // Treat the item as required.
    return itemSparqlWherePatternsFunction({ filter, schema: schema.item, ...otherParameters });
  }
}`,
  );

  export const filterMaybe = conditionalOutput(
    `${syntheticNamePrefix}filterMaybe`,
    code`\
function ${syntheticNamePrefix}filterMaybe<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${MaybeFilter}<ItemFilterT>, value: ${sharedImports.Maybe}<ItemT>): boolean => {
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
  );
}

export namespace OptionType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}
