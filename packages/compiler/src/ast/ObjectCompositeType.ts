import type { Maybe } from "purify-ts";
import type { CompositeType } from "./CompositeType.js";
import type { Name } from "./Name.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

/**
 * A composite of object types, such as an intersection or union.
 */
export interface ObjectCompositeType<
  ObjectCompositeTypeT extends ObjectIntersectionType | ObjectUnionType,
> extends CompositeType<ObjectCompositeTypeT | ObjectType> {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Should generated code derived from this type be visible outside its module?
   *
   * Defaults to true.
   */
  readonly export: boolean;

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Name;
}
