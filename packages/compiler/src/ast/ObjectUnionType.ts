import { AbstractObjectCompoundType } from "./AbstractObjectCompoundType.js";

/**
 * A disjunction/union of object types, corresponding to an sh:xone on a node shape.
 */
export class ObjectUnionType extends AbstractObjectCompoundType<ObjectUnionType> {
  override readonly kind = "ObjectUnionType";
}
