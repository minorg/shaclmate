import type { CardinalityType } from "ast/CardinalityType.js";
import type { Maybe } from "purify-ts";

/**
 * An unordered set of items of a specific type.
 */
export interface SetType<ItemTypeT extends CardinalityType.ItemType> {
  readonly kind: "SetType";

  readonly itemType: ItemTypeT;

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: number;

  /**
   * The set should be mutable in generated code.
   */
  readonly mutable: Maybe<boolean>;
}
