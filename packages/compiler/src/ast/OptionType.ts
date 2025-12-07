import { AbstractContainerType } from "ast/AbstractContainerType.js";
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
  }: ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super({
      comment: itemType.comment,
      itemType,
      label: itemType.label,
      name: itemType.name,
    });
  }
}
