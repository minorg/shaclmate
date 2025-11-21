import { ObjectCompositeType } from "./ObjectCompositeType.js";

/**
 * A conjunction/intersection of object types, corresponding to an sh:and on a node shape.
 */
export class ObjectIntersectionType extends ObjectCompositeType<ObjectIntersectionType> {
  readonly kind = "ObjectIntersectionType";
}
