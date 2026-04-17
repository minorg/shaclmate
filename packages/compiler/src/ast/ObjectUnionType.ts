import type { ObjectType } from "./ObjectType.js";
import type { UnionType } from "./UnionType.js";

export type ObjectUnionType = UnionType<UnionType<ObjectType> | ObjectType>;
