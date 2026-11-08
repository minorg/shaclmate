import type { IntersectionType } from "./IntersectionType.js";
import type { StructType } from "./StructType.js";

export type StructIntersectionType =
  IntersectionType<StructIntersectionType.MemberType>;

export namespace StructIntersectionType {
  export type MemberType = IntersectionType<MemberType> | StructType;
}
