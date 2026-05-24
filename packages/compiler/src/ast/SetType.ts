import { AbstractCollectionType } from "./AbstractCollectionType.js";

/**
 * An unordered set of items of a specific type.
 */
export class SetType<
  ItemTypeT extends SetType.ItemType = SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly kind = "Set";

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: bigint;

  constructor({
    itemType,
    minCount,
    ...superParameters
  }: { minCount: bigint } & Pick<
    ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0],
    "itemType" | "mutable"
  >) {
    super({
      ...superParameters,
      comment: itemType.comment,
      itemType,
      label: itemType.label,
      name: itemType.name,
      shapeIdentifier: itemType.shapeIdentifier,
    });
    this.minCount = minCount;
  }

  override equals(other: SetType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (this.minCount !== other.minCount) {
      return false;
    }

    return true;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      minCount: Number(this.minCount),
    };
  }
}

export namespace SetType {
  export type ItemType = AbstractCollectionType.ItemType;
  export const isItemType = AbstractCollectionType.isItemType;
}
