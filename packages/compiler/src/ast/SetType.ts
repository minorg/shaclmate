import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { PlaceholderType } from "./PlaceholderType.js";

/**
 * An unordered set of items of a specific type.
 */
export class SetType<
  ItemTypeT extends SetType.ItemType = SetType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  override readonly kind = "SetType";

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: number;

  constructor({
    itemType,
    minCount,
    ...superParameters
  }: { minCount: number } & Pick<
    ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0],
    "itemType" | "mutable"
  >) {
    super({
      ...superParameters,
      comment: itemType.comment,
      itemType,
      label: itemType.label,
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
}

export namespace SetType {
  export type ItemType = Exclude<
    AbstractCollectionType.ItemType,
    PlaceholderType
  >;
  export const isItemType = AbstractCollectionType.isItemType;
}
