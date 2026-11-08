import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";

type StructIntersectionMemberType =
  | DiscriminatedUnionType<StructIntersectionMemberType>
  | IntersectionType<StructIntersectionMemberType>
  | StructType;

export type StructIntersectionType =
  IntersectionType<StructIntersectionMemberType>;
