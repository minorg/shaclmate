import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";

type StructDiscriminatedUnionMemberType =
  | DiscriminatedUnionType<StructDiscriminatedUnionMemberType>
  | IntersectionType<StructDiscriminatedUnionMemberType>
  | StructType;

export type StructDiscriminatedUnionType =
  DiscriminatedUnionType<StructDiscriminatedUnionMemberType>;
