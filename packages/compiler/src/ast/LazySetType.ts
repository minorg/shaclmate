import { AbstractLazyType } from "./AbstractLazyType.js";
import type { SetType } from "./SetType.js";

export class LazySetType extends AbstractLazyType<
  SetType<AbstractLazyType.StructTypeConstraint>,
  SetType<AbstractLazyType.StructTypeConstraint>
> {
  override readonly kind = "LazySet";
}
