import type { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export abstract class OptionType<ItemTypeT extends Type = Type> {
  readonly itemType: ItemTypeT;
  readonly kind = "OptionType";

  constructor({ itemType }: { itemType: ItemTypeT }) {
    this.itemType = itemType;
  }
}
