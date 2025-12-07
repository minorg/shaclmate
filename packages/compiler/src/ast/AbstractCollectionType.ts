import { AbstractContainerType } from "ast/AbstractContainerType.js";
import type { Type } from "./Type.js";

/**
 * Abstract base class for a collection of items of a single type. This is the parent of ListType and SetType.
 */
export abstract class AbstractCollectionType<
  ItemTypeT extends Type = Type,
> extends AbstractContainerType<ItemTypeT> {
  abstract override readonly kind: "ListType" | "SetType";

  /**
   * The collection should be mutable in generated code.
   */
  readonly mutable: boolean;

  constructor({
    mutable,
    ...superParameters
  }: {
    mutable: boolean;
  } & ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0]) {
    super(superParameters);
    this.mutable = mutable;
  }

  override equals(other: AbstractCollectionType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (this.mutable !== other.mutable) {
      return false;
    }

    return true;
  }
}
