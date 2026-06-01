import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";

export type StructIntersectionType = IntersectionType<
  IntersectionType<StructType> | StructType
>;
