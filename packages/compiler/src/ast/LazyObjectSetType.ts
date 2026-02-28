import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { SetType } from "./SetType.js";

export class LazyObjectSetType extends AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly kind = "LazyObjectSetType";
}
