import type { CardinalityType } from "./CardinalityType.js";

/**
 * A type with exactly one value of an item type.
 */
export interface PlainType<ItemTypeT extends CardinalityType.ItemType> {
  readonly itemType: ItemTypeT;
  readonly kind: "PlainType";
}
