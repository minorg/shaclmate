import type { ObjectCompositeType } from "./ObjectCompositeType.js";

/**
 * A conjunction/intersection of object types, corresponding to an sh:and on a node shape.
 */
export interface ObjectIntersectionType
  extends ObjectCompositeType<ObjectIntersectionType> {
  readonly kind: "ObjectIntersectionType";
}
