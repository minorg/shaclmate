import { AbstractLazyType } from "./AbstractLazyType.js";

export class LazyType extends AbstractLazyType<
  AbstractLazyType.ItemTypeConstraint,
  AbstractLazyType.ItemTypeConstraint
> {
  override readonly kind = "Lazy";
}
