import { AbstractLazyType } from "./AbstractLazyType.js";
import type { OptionType } from "./OptionType.js";

export class LazyOptionType extends AbstractLazyType<
  OptionType<AbstractLazyType.StructTypeConstraint>,
  OptionType<AbstractLazyType.StructTypeConstraint>
> {
  override readonly kind = "LazyOption";
}
