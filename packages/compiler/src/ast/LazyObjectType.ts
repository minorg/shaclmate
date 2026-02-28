import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  override readonly kind = "LazyObjectType";
}
