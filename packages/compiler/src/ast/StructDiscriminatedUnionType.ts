import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { StructIntersectionType } from "./StructIntersectionType.js";
import type { StructType } from "./StructType.js";

export type StructDiscriminatedUnionType =
  DiscriminatedUnionType<StructDiscriminatedUnionType.MemberType>;

export namespace StructDiscriminatedUnionType {
  export type MemberType =
    | DiscriminatedUnionType<MemberType>
    | StructIntersectionType
    | StructType;
}
