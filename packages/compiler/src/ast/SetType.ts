import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { Type } from "./Type.js";

/**
 * An unordered set of items of a specific type.
 */
export class SetType<
  ItemTypeT extends Type = Type,
> extends AbstractCollectionType<ItemTypeT> {
  readonly kind = "SetType";

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: number;

  constructor({
    itemType,
    minCount,
    mutable,
  }: { minCount: number } & ConstructorParameters<
    typeof AbstractCollectionType<ItemTypeT>
  >[0]) {
    super({
      comment: itemType.comment,
      itemType,
      label: itemType.label,
      mutable,
      name: itemType.name,
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
