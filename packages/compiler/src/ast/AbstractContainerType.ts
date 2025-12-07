import { AbstractType } from "./AbstractType.js";
import { Type } from "./Type.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends Type = Type,
> extends AbstractType {
  abstract readonly kind: "ListType" | "OptionType" | "SetType";

  /**
   * Container item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: ItemTypeT;

  constructor({
    itemType,
    ...superParameters
  }: {
    itemType: ItemTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  override equals(other: AbstractContainerType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!Type.equals(this.itemType, other.itemType)) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `${this.kind}(itemType=${this.itemType})`;
  }
}
