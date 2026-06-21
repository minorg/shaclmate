import type { Maybe } from "purify-ts";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { StructDiscriminatedUnionType } from "./StructDiscriminatedUnionType.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class DiscriminatedUnionType<
  MemberTypeT extends
    DiscriminatedUnionType.MemberType = DiscriminatedUnionType.MemberType,
> extends AbstractCompoundType<
  DiscriminatedUnionType.Member<MemberTypeT>,
  MemberTypeT
> {
  override readonly kind = "DiscriminatedUnion";

  isStructDiscriminatedUnionType(): this is StructDiscriminatedUnionType {
    return (
      this.members.length > 0 &&
      this.members.every(
        (member) =>
          member.type.kind === "Struct" ||
          (member.type.kind === "DiscriminatedUnion" &&
            member.type.isStructDiscriminatedUnionType()),
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

export namespace DiscriminatedUnionType {
  export interface Member<TypeT extends DiscriminatedUnionType.MemberType>
    extends AbstractCompoundType.Member<TypeT> {
    readonly discriminantValue: Maybe<number | string>;
  }

  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
