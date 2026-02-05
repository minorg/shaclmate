import { AbstractContainerType } from "./AbstractContainerType.js";

/**
 * Abstract base class for a collection of items of a single type. This is the parent of ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends
    AbstractCollectionType.ItemType = AbstractCollectionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  abstract override readonly kind: "ListType" | "SetType";

  /**
   * The collection should be mutable in generated code.
   */
  readonly mutable: boolean;

  constructor({
    mutable,
    ...superParameters
  }: {
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.mutable = mutable;
  }

  override equals(other: AbstractCollectionType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (this.mutable !== other.mutable) {
      return false;
    }

    return true;
  }
}

export namespace AbstractCollectionType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}
