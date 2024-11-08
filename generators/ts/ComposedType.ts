import { invariant } from "ts-invariant";
import { Type } from "./Type.js";

/**
 * Abstract base class for AndType and OrType.
 */
export abstract class ComposedType extends Type {
  abstract override readonly kind: "And" | "Or";
  protected readonly types: readonly Type[];

  constructor({
    types,
    ...superParameters
  }: ConstructorParameters<typeof Type>[0] & { types: readonly Type[] }) {
    super(superParameters);
    invariant(types.length >= 2);
    this.types = types;
  }
}
