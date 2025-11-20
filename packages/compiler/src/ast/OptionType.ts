import { CollectionType } from "./CollectionType.js";
import type { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export class OptionType<
  ItemTypeT extends Type = Type,
> extends CollectionType<ItemTypeT> {
  readonly kind = "OptionType";

  constructor({ itemType }: { itemType: ItemTypeT }) {
    super({ itemType, mutable: false });
  }
}
