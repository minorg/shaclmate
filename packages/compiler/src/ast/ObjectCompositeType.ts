import type { TsFeature } from "enums/TsFeature.js";
import type { Maybe } from "purify-ts";
import type { CompositeType } from "./CompositeType.js";
import type { Name } from "./Name.js";
import type { ObjectType } from "./ObjectType.js";

/**
 * A composite of object types, such as an intersection or union.
 */
export interface ObjectCompositeType extends CompositeType<ObjectType> {
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

  /**
   * TypeScript features to generate.
   */
  readonly tsFeatures: Set<TsFeature>;
}
