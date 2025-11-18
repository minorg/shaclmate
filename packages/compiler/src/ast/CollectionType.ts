import type { Maybe } from "purify-ts";
import type { Type } from "./Type.js";

/**
 * A collection of items of a single type. This is the parent of ListType and SetType.
 */
export abstract class CollectionType<ItemTypeT extends Type = Type> {
  abstract readonly kind: "ListType" | "SetType";

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

  constructor({
    itemType,
    mutable,
  }: {
    itemType: ItemTypeT;
    mutable: Maybe<boolean>;
  }) {
    this.itemType = itemType;
    this.mutable = mutable;
  }
}
