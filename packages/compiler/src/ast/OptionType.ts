import type { CardinalityType } from "./CardinalityType.js";

/**
 * A type with zero or one values of an item type.
 */
export interface OptionType<ItemTypeT extends CardinalityType.ItemType>
  extends CardinalityType<ItemTypeT> {
  readonly kind: "OptionType";
}
