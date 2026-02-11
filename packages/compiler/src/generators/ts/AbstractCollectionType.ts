import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { arrayOf, type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Typeof } from "./Typeof.js";

namespace localSnippets {
  export const arrayEquals = conditionalOutput(
    `${syntheticNamePrefix}arrayEquals`,
    code`\
/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */  
function ${syntheticNamePrefix}arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | ${sharedSnippets.EqualsResult},
): ${sharedSnippets.EqualsResult} {
  if (leftArray.length !== rightArray.length) {
    return purify.Left({
      left: leftArray,
      right: rightArray,
      type: "ArrayLength",
    });
  }

  for (
    let leftElementIndex = 0;
    leftElementIndex < leftArray.length;
    leftElementIndex++
  ) {
    const leftElement = leftArray[leftElementIndex];

    const rightUnequals: ${sharedSnippets.EqualsResult}.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        ${sharedSnippets.EqualsResult}.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as ${sharedSnippets.EqualsResult}.Unequal,
      );
    }

    if (rightUnequals.length === rightArray.length) {
      // All right elements were unequal to the left element
      return purify.Left({
        left: {
          array: leftArray,
          element: leftElement,
          elementIndex: leftElementIndex,
        },
        right: {
          array: rightArray,
          unequals: rightUnequals,
        },
        type: "ArrayElement",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return ${sharedSnippets.EqualsResult}.Equal;
}`,
  );

  export const filterArray = conditionalOutput(
    `${syntheticNamePrefix}filterArray`,
    code`\
function ${syntheticNamePrefix}filterArray<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${sharedSnippets.CollectionFilter}<ItemFilterT>, values: readonly ItemT[]): boolean => {
    for (const value of values) {
      if (!filterItem(filter, value)) {
        return false;
      }
    }

    if (typeof filter.${syntheticNamePrefix}maxCount !== "undefined" && values.length > filter.${syntheticNamePrefix}maxCount) {
      return false;
    }

    if (typeof filter.${syntheticNamePrefix}minCount !== "undefined" && values.length < filter.${syntheticNamePrefix}minCount) {
      return false;
    }

    return true;
  }
}`,
  );

  export const isReadonlyBooleanArray = conditionalOutput(
    `${syntheticNamePrefix}isReadonlyBooleanArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyBooleanArray(x: unknown): x is readonly boolean[] {
  return Array.isArray(x) && x.every(z => typeof z === "boolean");
}`,
  );

  export const isReadonlyNumberArray = conditionalOutput(
    `${syntheticNamePrefix}isReadonlyNumberArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyNumberArray(x: unknown): x is readonly number[] {
  return Array.isArray(x) && x.every(z => typeof z === "number");
}`,
  );

  export const isReadonlyObjectArray = conditionalOutput(
    `${syntheticNamePrefix}isReadonlyObjectArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyObjectArray(x: unknown): x is readonly object[] {
  return Array.isArray(x) && x.every(z => typeof z === "object");
}`,
  );

  export const isReadonlyStringArray = conditionalOutput(
    `${syntheticNamePrefix}isReadonlyStringArray`,
    code`\
function ${syntheticNamePrefix}isReadonlyStringArray(x: unknown): x is readonly string[] {
  return Array.isArray(x) && x.every(z => typeof z === "string");
}`,
  );
}

/**
 * Abstract base class for ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends AbstractCollectionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  protected readonly _mutable: boolean;
  protected readonly minCount: number;

  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    minCount,
    mutable,
    ...superParameters
  }: {
    minCount: number;
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.minCount = minCount;
    invariant(this.minCount >= 0);
    this._mutable = mutable;
    if (mutable) {
      invariant(this.minCount === 0);
    }
  }

  @Memoize()
  override get conversions(): readonly AbstractContainerType.Conversion[] {
    const conversions: AbstractContainerType.Conversion[] = [];

    // Try to do some conversions from types itemType can be converted to
    // For example, if itemType is a NamedNode, it can be converted from a string, so here we'd accept:
    // readonly NamedNode[] (no conversion)
    // readonly string[] (map to NamedNodes)

    // We only consider discriminating by (item) typeof. For example, the types above could be discriminated by the branches
    // array.every(item => typeof item === "object")
    // array.every(item => typeof item === "string")

    const itemTypeConversionsByTypeof = {} as Record<
      Typeof,
      AbstractContainerType.Conversion
    >;
    if (this.itemType.typeofs.length === 1) {
      itemTypeConversionsByTypeof[this.itemType.typeofs[0]] = {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === ${this.itemType.typeofs[0]}`,
        sourceTypeName: this.itemType.name,
        sourceTypeof: this.itemType.typeofs[0],
      };

      for (const itemTypeConversion of this.itemType.conversions) {
        if (!itemTypeConversionsByTypeof[itemTypeConversion.sourceTypeof]) {
          itemTypeConversionsByTypeof[itemTypeConversion.sourceTypeof] =
            itemTypeConversion;
        }
      }
    }

    if (this.minCount === 0) {
      conversions.push({
        conversionExpression: () => code`${arrayOf([])}`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "undefined"`,
        sourceTypeName: code`undefined`,
        sourceTypeof: "undefined",
      });

      if (Object.keys(itemTypeConversionsByTypeof).length <= 1) {
        // There were no additional conversions with different item typeof's, so we don't need to check .every or do .map
        // Just check that the original value is an array with typeof "object". Array.isArray() doesn't narrow types for some reason.
        conversions.push({
          conversionExpression: (value) =>
            // Defensive copy
            code`${value}${this.mutable ? ".concat()" : ""}`,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object"`,
          sourceTypeName: code`readonly (${this.itemType.name})[]`,
          sourceTypeof: "object",
        });
      } else {
        // There were additional conversions with different item typeof's.
        // We do .every (per above) to discriminate array types with different item typeof's and .map to convert the array at runtime.
        for (const [itemTypeof, itemTypeofConversion] of Object.entries(
          itemTypeConversionsByTypeof,
        )) {
          conversions.push({
            conversionExpression: (value) => {
              const itemTypeConversionExpression =
                itemTypeofConversion.conversionExpression(code`item`);
              return itemTypeConversionExpression.toString() !== "item"
                ? code`${value}.map(item => ${itemTypeConversionExpression})`
                : // Defensive copy
                  code`${value}${this.mutable ? ".concat()" : ""}`;
            },
            sourceTypeCheckExpression: (value) =>
              // Use the type guard functions to discriminate different array types.
              code`${(localSnippets as any)[`isReadonly${itemTypeof[0].toUpperCase()}${itemTypeof.slice(1)}Array`]}(${value})`,
            sourceTypeName: code`readonly (${itemTypeofConversion.sourceTypeName})[]`,
            sourceTypeof: itemTypeofConversion.sourceTypeof,
          });
        }
      }
    } else {
      // minCount > 0
      // Don't try to do any item type conversions here (yet).
      conversions.push({
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`${sharedImports.NonEmptyList}.isNonEmpty(${value})`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${localSnippets.arrayEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${localSnippets.filterArray}<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${sharedSnippets.CollectionFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    return new AbstractContainerType.GraphqlType(
      code`new ${sharedImports.GraphQLList}(${this.itemType.graphqlType.name})`,
    );
  }

  override get mutable(): boolean {
    return this._mutable || this.itemType.mutable;
  }

  @Memoize()
  override get name(): Code {
    if (this._mutable) {
      return code`(${this.itemType.name})[]`;
    }
    if (this.minCount === 0) {
      return code`readonly (${this.itemType.name})[]`;
    }
    return code`${sharedImports.NonEmptyList}<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${sharedSnippets.CollectionSchema}<${this.itemType.schemaType}>`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      minCount: this.minCount,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    let expression = variables.value;
    if (!this._mutable && this.minCount > 0) {
      expression = code`${sharedImports.NonEmptyList}.fromArray(${expression}).unsafeCoerce()`;
    }
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: code`item` },
    });
    return itemFromJsonExpression === "item"
      ? expression
      : code`${expression}.map(item => (${itemFromJsonExpression}))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
  >[0]): Code {
    return variables.value;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractContainerType<ItemTypeT>["hashStatements"]>[0]): Code {
    return code`for (const item${depth} of ${variables.value}) { ${this.itemType.hashStatements(
      {
        depth: depth + 1,
        variables: {
          hasher: variables.hasher,
          value: code`item${depth}`,
        },
      },
    )} }`;
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
  ): Code {
    let schema = code`${this.itemType.jsonZodSchema(parameters)}.array()`;
    if (this.minCount > 0) {
      schema = code`${schema}.nonempty().min(${this.minCount})`;
    } else {
      schema = code`${schema}.default(() => [])`;
    }
    return schema;
  }

  override toJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["toJsonExpression"]
  >[0]): Code {
    return code`${variables.value}.map(item => (${this.itemType.toJsonExpression({ variables: { value: code`item` } })}))`;
  }
}

export namespace AbstractCollectionType {
  export type Conversion = AbstractContainerType.Conversion;
  export type DiscriminantProperty = AbstractContainerType.DiscriminantProperty;
  export const GraphqlType = AbstractContainerType.GraphqlType;
  export type GraphqlType = AbstractContainerType.GraphqlType;
  export const isItemType = AbstractContainerType.isItemType;
  export type ItemType = AbstractContainerType.ItemType;
  export const JsonType = AbstractContainerType.JsonType;
  export type JsonType = AbstractContainerType.JsonType;
}
