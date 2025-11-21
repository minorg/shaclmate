import { CompositeType } from "./CompositeType.js";
import type { Type } from "./Type.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType extends CompositeType<Type> {
  readonly kind = "UnionType";
}
