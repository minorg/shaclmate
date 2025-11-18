import type { ObjectCompositeType } from "./ObjectCompositeType.js";

/**
 * A disjunction/union of object types, corresponding to an sh:xone on a node shape.
 */
export interface ObjectUnionType extends ObjectCompositeType<ObjectUnionType> {
  readonly kind: "ObjectUnionType";
}
