import type { IntersectionType } from "./IntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { UnionType } from "./UnionType.js";

export interface Ast {
  readonly namedIntersectionTypes: readonly IntersectionType[];
  readonly namedObjectTypes: readonly ObjectType[];
  readonly namedUnionTypes: readonly UnionType[];
}
