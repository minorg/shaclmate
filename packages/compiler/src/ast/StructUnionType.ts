import type { StructType } from "./StructType.js";
import type { UnionType } from "./UnionType.js";

export type StructUnionType = UnionType<UnionType<StructType> | StructType>;
