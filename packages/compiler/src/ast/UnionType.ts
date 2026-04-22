import type { Maybe } from "purify-ts";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType<
  MemberTypeT extends UnionType.MemberType = UnionType.MemberType,
> extends AbstractCompoundType<UnionType.Member<MemberTypeT>, MemberTypeT> {
  override readonly kind = "UnionType";

  isObjectUnionType(): this is ObjectUnionType {
    return (
      this.members.length > 0 &&
      this.members.every(
        (member) =>
          member.type.kind === "ObjectType" ||
          (member.type.kind === "UnionType" && member.type.isObjectUnionType()),
      )
    );
  }
}

export namespace UnionType {
  export interface Member<TypeT extends UnionType.MemberType>
    extends AbstractCompoundType.Member<TypeT> {
    readonly discriminantValue: Maybe<number | string>;
  }

  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
