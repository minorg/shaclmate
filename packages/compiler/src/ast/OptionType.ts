import type { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export interface OptionType<ItemTypeT extends Type = Type> {
  readonly itemType: ItemTypeT;
  readonly kind: "OptionType";
}
