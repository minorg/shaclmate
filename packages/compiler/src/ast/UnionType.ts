import { AbstractCompoundType } from "./AbstractCompoundType.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType extends AbstractCompoundType {
  override readonly kind = "UnionType";
  readonly memberDiscriminantValues: readonly string[];

  constructor({
    memberDiscriminantValues,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
  } & ConstructorParameters<typeof AbstractCompoundType>[0]) {
    super(superParameters);
    this.memberDiscriminantValues = memberDiscriminantValues;
  }
}

export namespace UnionType {
  export type MemberType = AbstractCompoundType.MemberType;
  export const isMemberType = AbstractCompoundType.isMemberType;
}
