import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType<
  MemberTypeT extends IntersectionType.MemberType = IntersectionType.MemberType,
> extends AbstractCompoundType<MemberTypeT> {
  override readonly kind = "IntersectionType";

  isObjectIntersectionType(): this is ObjectIntersectionType {
    return this.memberTypes.every(
      (memberType) =>
        memberType.kind === "ObjectType" ||
        (memberType.kind === "IntersectionType" &&
          memberType.isObjectIntersectionType),
    );
  }
}

export namespace IntersectionType {
  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
