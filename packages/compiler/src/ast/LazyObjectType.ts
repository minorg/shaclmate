import { AbstractLazyObjectType } from "./AbstractLazyOptionType.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  readonly kind = "LazyObjectType";
}
