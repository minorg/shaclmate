import type { Maybe } from "purify-ts";
import type { Type } from "./Type.js";

/**
 * A collection of items of a single type. This is the parent of ListType and SetType.
 */
export interface CollectionType<ItemTypeT extends Type = Type> {
  readonly kind: "ListType" | "SetType";

  /**
   * Collection item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: ItemTypeT;

  /**
   * The collection should be mutable in generated code.
   */
  readonly mutable: Maybe<boolean>;
}
