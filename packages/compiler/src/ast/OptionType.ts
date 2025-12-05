import { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export class OptionType<ItemTypeT extends Type = Type> {
  readonly itemType: ItemTypeT;
  readonly kind = "OptionType";

  constructor({ itemType }: { itemType: ItemTypeT }) {
    this.itemType = itemType;
  }

  equals(other: OptionType<ItemTypeT>): boolean {
    if (!Type.equals(this.itemType, other.itemType)) {
      return false;
    }

    return true;
  }
}
