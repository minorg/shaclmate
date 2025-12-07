import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { Type } from "./Type.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType extends AbstractCompoundType<Type> {
  readonly kind = "UnionType";
}
