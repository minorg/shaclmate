import { AbstractLazyType } from "./AbstractLazyType.js";

export class LazyType extends AbstractLazyType<
  AbstractLazyType.StructTypeConstraint,
  AbstractLazyType.StructTypeConstraint
> {
  override readonly kind = "Lazy";
}
