import type { CardinalityType } from "./CardinalityType.js";

/**
 * A type with zero or one values of an item type.
 */
export interface OptionType<ItemTypeT extends CardinalityType.ItemType> {
  readonly itemType: ItemTypeT;
  readonly kind: "OptionType";
}
