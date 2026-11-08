import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";

type StructIntersectionMemberType =
  | IntersectionType<StructIntersectionMemberType>
  | StructType;

export type StructIntersectionType =
  IntersectionType<StructIntersectionMemberType>;
