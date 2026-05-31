import { AbstractLazyType } from "./AbstractLazyType.js";
import type { SetType } from "./SetType.js";

export class LazySetType extends AbstractLazyType<
  SetType<AbstractLazyType.ItemTypeConstraint>,
  SetType<AbstractLazyType.ItemTypeConstraint>
> {
  override readonly kind = "LazySet";
}
