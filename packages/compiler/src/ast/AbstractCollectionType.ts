import { AbstractType } from "ast/AbstractType.js";
import { Type } from "./Type.js";

/**
 * Abstract base class for a collection of items of a single type. This is the parent of ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends Type = Type,
> extends AbstractType {
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
    ...superParameters,
  }: {
    itemType: ItemTypeT;
    mutable: boolean;
  }  & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
    this.mutable = mutable;
  }

  equals(other: AbstractCollectionType<ItemTypeT>): boolean {
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
