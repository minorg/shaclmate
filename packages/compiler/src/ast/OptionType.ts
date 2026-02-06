import { AbstractContainerType } from "./AbstractContainerType.js";
import type { PlaceholderType } from "./PlaceholderType.js";

/**
 * A type with zero or one values of an item type.
 */
export class OptionType<
  ItemTypeT extends OptionType.ItemType = OptionType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  readonly kind = "OptionType";

  constructor({
    itemType,
  }: Pick<
    ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0],
    "itemType"
  >) {
    super({
      comment: itemType.comment,
      itemType,
      label: itemType.label,
    });
  }
}

export namespace OptionType {
  export type ItemType = Exclude<
    AbstractContainerType.ItemType,
    PlaceholderType
  >;
  export const isItemType = AbstractContainerType.isItemType;
}
