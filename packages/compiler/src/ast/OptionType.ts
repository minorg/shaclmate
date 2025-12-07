import { AbstractContainerType } from "./AbstractContainerType.js";
import type { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export class OptionType<
  ItemTypeT extends Type = Type,
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
      name: itemType.name,
    });
  }
}
