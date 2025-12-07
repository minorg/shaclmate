import { ObjectCompoundType } from "./ObjectCompoundType.js";

/**
 * A disjunction/union of object types, corresponding to an sh:xone on a node shape.
 */
export class ObjectUnionType extends ObjectCompoundType<ObjectUnionType> {
  readonly kind = "ObjectUnionType";
}
