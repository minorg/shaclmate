import { CompositeType } from "./CompositeType.js";
import type { Type } from "./Type.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType extends CompositeType<Type> {
  readonly kind = "IntersectionType";
}
