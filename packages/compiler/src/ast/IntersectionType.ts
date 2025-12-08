import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { Type } from "./Type.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType extends AbstractCompoundType<Type> {
  readonly kind = "IntersectionType";
}
