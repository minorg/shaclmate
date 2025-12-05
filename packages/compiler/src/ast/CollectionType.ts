import { Type } from "./Type.js";

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
  readonly mutable: boolean;

  constructor({
    itemType,
    mutable,
  }: {
    itemType: ItemTypeT;
    mutable: boolean;
  }) {
    this.itemType = itemType;
    this.mutable = mutable;
  }

  equals(other: CollectionType<ItemTypeT>): boolean {
    if (!Type.equals(this.itemType, other.itemType)) {
      return false;
    }

    if (this.mutable !== other.mutable) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `${this.kind}(itemType=${this.itemType})`;
  }
}
