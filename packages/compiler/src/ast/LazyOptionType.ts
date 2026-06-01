import { AbstractLazyType } from "./AbstractLazyType.js";
import type { OptionType } from "./OptionType.js";

export class LazyOptionType extends AbstractLazyType<
  OptionType<AbstractLazyType.ItemTypeConstraint>,
  OptionType<AbstractLazyType.ItemTypeConstraint>
> {
  override readonly kind = "LazyOption";
}
