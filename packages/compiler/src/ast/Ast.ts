import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";
import type { UnionType } from "./UnionType.js";

export interface Ast {
  readonly lazyTypesCount: number;
  readonly namedTypes: readonly (IntersectionType | StructType | UnionType)[];
}
