import type { CollectionType } from "./CollectionType.js";
import type { Type } from "./Type.js";

/**
 * An unordered set of items of a specific type.
 */
export interface SetType<ItemTypeT extends Type = Type>
  extends CollectionType<ItemTypeT> {
  readonly kind: "SetType";

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: number;
}
