import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import type { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
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
  override readonly typeofs = ["object" as const];

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
      code: code`${this._mutable ? this.reusables.snippets.convertToMutableArray : this.reusables.snippets.convertToReadonlyArray}(${itemConversionFunction.code})`,
      sourceTypes,
    };
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
    return code`${!this._mutable ? "readonly " : ""}(${this.itemType.name})[]`;
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
  export type DiscriminantProperty = AbstractContainerType.DiscriminantProperty;
  export const GraphqlType = AbstractContainerType.GraphqlType;
  export type GraphqlType = AbstractContainerType.GraphqlType;
  export const isItemType = AbstractContainerType.isItemType;
  export type ItemType = AbstractContainerType.ItemType;
  export const JsonType = AbstractContainerType.JsonType;
  export type JsonType = AbstractContainerType.JsonType;
}
