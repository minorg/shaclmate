import type { ObjectType } from "./ObjectType.js";
import type { UnionType } from "./UnionType.js";

export type StructUnionType = UnionType<UnionType<ObjectType> | ObjectType>;
