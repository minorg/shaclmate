import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

export interface Ast {
  readonly objectIntersectionTypes: readonly ObjectIntersectionType[];
  readonly objectTypes: readonly ObjectType[];
  readonly objectUnionTypes: readonly ObjectUnionType[];
}
