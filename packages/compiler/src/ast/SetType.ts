import type { Maybe } from "purify-ts";
import type { Type } from "./Type.js";

/**
 * An unordered set of items of a specific type.
 */
export interface SetType<ItemTypeT extends Type = Type> {
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
