import type { Maybe } from "purify-ts";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { StructUnionType } from "./StructUnionType.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType<
  MemberTypeT extends UnionType.MemberType = UnionType.MemberType,
> extends AbstractCompoundType<UnionType.Member<MemberTypeT>, MemberTypeT> {
  override readonly kind = "Union";

  isStructUnionType(): this is StructUnionType {
    return (
      this.members.length > 0 &&
      this.members.every(
        (member) =>
          member.type.kind === "Struct" ||
          (member.type.kind === "Union" && member.type.isStructUnionType()),
      )
    );
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      members: !this.recursive
        ? this.members.map((member) => ({
            discriminantValue: member.discriminantValue.extract(),
            type: (member.type as any).toJSON(),
          }))
        : undefined,
    };
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
