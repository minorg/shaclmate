import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractContainerType } from "./AbstractContainerType.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends AbstractCollectionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  protected readonly _mutable: boolean;

  override readonly discriminantProperty: Maybe<AbstractContainerType.DiscriminantProperty> =
    Maybe.empty();
  override readonly graphqlArgs: AbstractContainerType<ItemTypeT>["graphqlArgs"] =
    Maybe.empty();

  constructor({
    mutable,
    ...superParameters
  }: {
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this._mutable = mutable;
  }

  @Memoize()
  override get equalsFunction(): Code {
    return code`((left, right) => ${this.reusables.snippets.arrayEquals}(left, right, ${this.itemType.equalsFunction}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`${this.reusables.snippets.filterArray}<${this.itemType.expression}, ${this.itemType.filterType}>(${this.itemType.filterFunction})`;
  }

  @Memoize()
  get filterType(): Code {
    return code`${this.reusables.snippets.CollectionFilter}<${this.itemType.filterType}>`;
  }

  @Memoize()
  override get graphqlType(): AbstractContainerType.GraphqlType {
    return new AbstractContainerType.GraphqlType(
      code`new ${this.reusables.imports.GraphQLList}(${this.itemType.graphqlType.expression})`,
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
  override get schemaType(): Code {
    return code`${this.reusables.snippets.CollectionSchema}<${this.itemType.schemaType}>`;
  }

  @Memoize()
  override get validationFunction(): Maybe<Code> {
    return Maybe.of(
      code`${this.reusables.snippets.validateArray}(${this.itemType.validationFunction.orDefault(
        this.itemValidationFunctionDefault,
      )}, ${literalOf(!this._mutable)})`,
    );
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return code`${!this._mutable ? "readonly " : ""}(${this.itemType.expression})[]`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<
    AbstractContainerType<ItemTypeT>["graphqlResolveExpression"]
  >[0]): Code {
    return variables.value;
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
  export type ConversionFunction = AbstractContainerType.ConversionFunction;
  export type DiscriminantProperty = AbstractContainerType.DiscriminantProperty;
  export const GraphqlType = AbstractContainerType.GraphqlType;
  export type GraphqlType = AbstractContainerType.GraphqlType;
  export const isItemType = AbstractContainerType.isItemType;
  export type ItemType = AbstractContainerType.ItemType;
  export const JsonType = AbstractContainerType.JsonType;
  export type JsonType = AbstractContainerType.JsonType;
}
