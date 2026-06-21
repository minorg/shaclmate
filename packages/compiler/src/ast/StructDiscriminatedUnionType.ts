import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { StructType } from "./StructType.js";

export type StructDiscriminatedUnionType = DiscriminatedUnionType<
  DiscriminatedUnionType<StructType> | StructType
>;
