import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { Type } from "./Type.js";

/**
 * A disjunction/union of types, corresponding to an sh:xone.
 */
export class UnionType extends AbstractCompoundType<Type> {
  override readonly kind = "UnionType";
  readonly memberDiscriminantValues: readonly string[];

  constructor({
    memberDiscriminantValues,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
  } & ConstructorParameters<typeof AbstractCompoundType<Type>>[0]) {
    super(superParameters);
    this.memberDiscriminantValues = memberDiscriminantValues;
  }
}
