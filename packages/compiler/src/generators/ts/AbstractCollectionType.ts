import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
import type { Typeof } from "./Typeof.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends AbstractCollectionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  protected readonly _mutable: boolean;
  protected readonly minCount: bigint;

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
    minCount: bigint;
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.minCount = minCount;
    invariant(this.minCount >= 0n);
    this._mutable = mutable;
    if (mutable) {
      invariant(this.minCount === 0n);
    }
  }

  @Memoize()
  override get conversionFunction(): AbstractType.ConversionFunction {
    const itemConversionFunction = this.itemType.conversionFunction;
    const sourceTypes: AbstractType.ConversionFunction["sourceTypes"] = [
      {
        name: code`readonly (${joinCode(
          itemConversionFunction.sourceTypes.map(
            (itemSourceType) => code`${itemSourceType.name}`,
          ),
          { on: " | " },
        )})[]`,
        typeof: "object",
      },
    ];
    if (this.minCount === 0n) {
      sourceTypes.push({
        name: "undefined",
        typeof: "undefined",
      });
    }
    return {
      code: code`${this.reusables.snippets.convertToArray}(${itemConversionFunction.code})`,
      sourceTypes,
    };
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

    if (this.minCount === 0n) {
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
          const itemVariable = code`item`;

          conversions.push({
            conversionExpression: (value) => {
              const itemTypeConversionExpression =
                itemTypeofConversion.conversionExpression(itemVariable);
              return !codeEquals(itemTypeConversionExpression, itemVariable)
                ? code`${value}.map(item => ${itemTypeConversionExpression})`
                : // Defensive copy
                  code`${value}${this.mutable ? ".concat()" : ""}`;
            },
            sourceTypeCheckExpression: (value) => {
              switch (itemTypeof as Typeof) {
                case "bigint":
                  return code`${this.reusables.snippets.isReadonlyBigIntArray}(${value})`;
                case "boolean":
                  return code`${this.reusables.snippets.isReadonlyBooleanArray}(${value})`;
                case "number":
                  return code`${this.reusables.snippets.isReadonlyNumberArray}(${value})`;
                case "object":
                  return code`${this.reusables.snippets.isReadonlyObjectArray}(${value})`;
                case "string":
                  return code`${this.reusables.snippets.isReadonlyStringArray}(${value})`;
                case "function":
                case "symbol":
                case "undefined":
                  throw new Error(
                    `source type check on ${itemTypeof} not implemented`,
                  );
              }
            },
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
          code`${this.reusables.imports.NonEmptyList}.isNonEmpty(${value})`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      });
    }

    return conversions;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${this.reusables.snippets.arrayEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.reusables.snippets.filterArray}<${this.itemType.name}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.reusables.snippets.CollectionFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    return new AbstractContainerType.GraphqlType(
      code`new ${this.reusables.imports.GraphQLList}(${this.itemType.graphqlType.name})`,
      this.reusables,
    );
  }

  @Memoize()
  get hashFunction(): Code {
    return code`${this.reusables.snippets.hashArray}(${this.itemType.hashFunction})`;
  }

  override get mutable(): boolean {
    return this._mutable || this.itemType.mutable;
  }

  @Memoize()
  override get name(): Code {
    if (this._mutable) {
      return code`(${this.itemType.name})[]`;
    }
    if (this.minCount === 0n) {
      return code`readonly (${this.itemType.name})[]`;
    }
    return code`${this.reusables.imports.NonEmptyList}<${this.itemType.name}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.CollectionSchema}<${this.itemType.schemaType}>`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      minCount: this.minCount > 0n ? Number(this.minCount) : undefined,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["fromJsonExpression"]
  >[0]): Code {
    let expression = variables.value;
    if (!this._mutable && this.minCount > 0n) {
      expression = code`${this.reusables.imports.NonEmptyList}.fromArray(${expression}).unsafeCoerce()`;
    }
    if (this.minCount === 0n) {
      expression = code`(${expression} ?? [])`;
    }
    const valueVariable = code`item`;
    const itemFromJsonExpression = this.itemType.fromJsonExpression({
      variables: { value: valueVariable },
    });
    return codeEquals(itemFromJsonExpression, valueVariable)
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

  override jsonSchema(
    parameters: Parameters<AbstractContainerType<ItemTypeT>["jsonSchema"]>[0],
  ): Code {
    let schema = code`${this.itemType.jsonSchema(parameters)}.array()`;
    if (this.minCount > 0n) {
      schema = code`${schema}.nonempty().min(${this.minCount})`;
    } else {
      schema = code`${schema}.optional()`;
    }
    if (!this._mutable) {
      schema = code`${schema}.readonly()`;
    }
    return schema;
  }

  override jsonUiSchemaElement(
    parameters: Parameters<
      AbstractContainerType<ItemTypeT>["jsonUiSchemaElement"]
    >[0],
  ): Maybe<Code> {
    return this.itemType.jsonUiSchemaElement(parameters);
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
