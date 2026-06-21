import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { StructType } from "./StructType.js";

export type StructUnionType = DiscriminatedUnionType<
  DiscriminatedUnionType<StructType> | StructType
>;
