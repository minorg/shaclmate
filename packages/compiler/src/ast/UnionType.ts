import { CompoundType } from "./CompoundType.js";
import type { Type } from "./Type.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType extends CompoundType<Type> {
  readonly kind = "UnionType";
}
