import type { CardinalityType } from "./CardinalityType.js";

/**
 * A type with exactly one value of an item type.
 */
export interface PlainType<ItemTypeT extends CardinalityType.ItemType>
  extends CardinalityType<ItemTypeT> {
  readonly kind: "PlainType";
}
