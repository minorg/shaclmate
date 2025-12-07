import { AbstractContainerType } from "ast/AbstractContainerType.js";
import type { Type } from "./Type.js";

/**
 * A type with zero or one values of an item type.
 */
export class OptionType<
  ItemTypeT extends Type = Type,
> extends AbstractContainerType<ItemTypeT> {
  readonly kind = "OptionType";
}
