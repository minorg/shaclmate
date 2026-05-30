import type { IntersectionType } from "./IntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { UnionType } from "./UnionType.js";

export interface Ast {
  readonly lazyTypesCount: number;
  readonly namedTypes: readonly (IntersectionType | ObjectType | UnionType)[];
}
