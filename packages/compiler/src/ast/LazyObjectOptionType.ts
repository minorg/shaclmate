import { AbstractLazyObjectType } from "./AbstractLazyOptionType.js";
import type { OptionType } from "./OptionType.js";

export class LazyObjectOptionType extends AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  readonly kind = "LazyObjectOptionType";
}
