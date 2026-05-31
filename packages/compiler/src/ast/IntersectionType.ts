import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { StructIntersectionType } from "./StructIntersectionType.js";

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

  isStructIntersectionType(): this is StructIntersectionType {
    return (
      this.members.length > 0 &&
      this.members.every(
        (member) =>
          member.type.kind === "Struct" ||
          (member.type.kind === "Intersection" &&
            member.type.isStructIntersectionType()),
      )
    );
  }
}

export namespace IntersectionType {
  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
