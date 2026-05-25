import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";

/**
 * A conjunction ("and") of types, corresponding to an sh:and.
 */
export class IntersectionType<
  MemberTypeT extends IntersectionType.MemberType = IntersectionType.MemberType,
> extends AbstractCompoundType<
  AbstractCompoundType.Member<MemberTypeT>,
  MemberTypeT
> {
  override readonly kind = "Intersection";

  isObjectIntersectionType(): this is ObjectIntersectionType {
    return (
      this.members.length > 0 &&
      this.members.every(
        (member) =>
          member.type.kind === "Object" ||
          (member.type.kind === "Intersection" &&
            member.type.isObjectIntersectionType()),
      )
    );
  }
}

export namespace IntersectionType {
  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
