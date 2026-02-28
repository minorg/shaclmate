import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { OptionType } from "./OptionType.js";

export class LazyObjectOptionType extends AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly kind = "LazyObjectOptionType";
}
