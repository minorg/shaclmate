import { CompoundType } from "./CompoundType.js";
import type { Type } from "./Type.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType extends CompoundType<Type> {
  readonly kind = "IntersectionType";
}
