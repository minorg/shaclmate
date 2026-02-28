import { AbstractObjectCompoundType } from "./AbstractObjectCompoundType.js";

/**
 * A conjunction/intersection of object types, corresponding to an sh:and on a node shape.
 */
export class ObjectIntersectionType extends AbstractObjectCompoundType<ObjectIntersectionType> {
  override readonly kind = "ObjectIntersectionType";
}
