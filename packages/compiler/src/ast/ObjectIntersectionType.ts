import { ObjectCompoundType } from "./ObjectCompoundType.js";

/**
 * A conjunction/intersection of object types, corresponding to an sh:and on a node shape.
 */
export class ObjectIntersectionType extends ObjectCompoundType<ObjectIntersectionType> {
  readonly kind = "ObjectIntersectionType";
}
