import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { Type } from "./Type.js";

/**
 * Abstract base class of LazyObjectOptionType, LazyObjectSetType, and LazyObjectType.
 */
export abstract class AbstractLazyObjectType<
  PartialTypeT extends AbstractLazyObjectType.PartialTypeConstraint,
  ResolvedTypeT extends AbstractLazyObjectType.ResolvedTypeConstraint,
> {
  readonly partialType: PartialTypeT;
  readonly resolvedType: ResolvedTypeT;

  constructor({
    partialType,
    resolvedType,
  }: {
    partialType: PartialTypeT;
    resolvedType: ResolvedTypeT;
  }) {
    this.partialType = partialType;
    this.resolvedType = resolvedType;
  }

  equals(other: AbstractLazyObjectType<PartialTypeT, ResolvedTypeT>): boolean {
    if (!Type.equals(this.partialType, other.partialType)) {
      return false;
    }

    if (!Type.equals(this.resolvedType, other.resolvedType)) {
      return false;
    }

    return true;
  }
}

export namespace AbstractLazyObjectType {
  export type ObjectTypeConstraint = ObjectType | ObjectUnionType;
  export type PartialTypeConstraint =
    | ObjectTypeConstraint
    | OptionType<ObjectTypeConstraint>
    | SetType<ObjectTypeConstraint>;
  export type ResolvedTypeConstraint = PartialTypeConstraint;
}
