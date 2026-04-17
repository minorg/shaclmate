import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType<
  MemberTypeT extends UnionType.MemberType = UnionType.MemberType,
> extends AbstractCompoundType<MemberTypeT> {
  override readonly kind = "UnionType";
  readonly memberDiscriminantValues: readonly string[];

  constructor({
    memberDiscriminantValues,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
  } & ConstructorParameters<typeof AbstractCompoundType<MemberTypeT>>[0]) {
    super(superParameters);
    this.memberDiscriminantValues = memberDiscriminantValues;
  }

  isObjectUnionType(): this is ObjectUnionType {
    return this.memberTypes.every(
      (memberType) =>
        memberType.kind === "ObjectType" ||
        (memberType.kind === "UnionType" && memberType.isObjectUnionType),
    );
  }
}

export namespace UnionType {
  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
