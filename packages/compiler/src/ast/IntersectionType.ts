import { AbstractCompoundType } from "./AbstractCompoundType.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType extends AbstractCompoundType {
  override readonly kind = "IntersectionType";
}
