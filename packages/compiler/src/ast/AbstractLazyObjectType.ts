import { AbstractType } from "./AbstractType.js";
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
  ResolveTypeT extends AbstractLazyObjectType.ResolveTypeConstraint,
> extends AbstractType {
  abstract readonly kind:
    | "LazyObjectOptionType"
    | "LazyObjectSetType"
    | "LazyObjectType";
  readonly partialType: PartialTypeT;
  readonly resolveType: ResolveTypeT;

  constructor({
    partialType,
    resolveType,
    ...superParameters
  }: {
    partialType: PartialTypeT;
    resolveType: ResolveTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.partialType = partialType;
    this.resolveType = resolveType;
  }

  override get recursive(): boolean {
    return this.partialType.recursive;
  }

  override equals(
    other: AbstractLazyObjectType<PartialTypeT, ResolveTypeT>,
  ): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!Type.equals(this.partialType, other.partialType)) {
      return false;
    }

    if (!Type.equals(this.resolveType, other.resolveType)) {
      return false;
    }

    return true;
  }

  override toString() {
    return `${this.kind}(partialType=${this.partialType}, resolveType=${this.resolveType})`;
  }
}

export namespace AbstractLazyObjectType {
  export type ObjectTypeConstraint = ObjectType | ObjectUnionType;
  export type PartialTypeConstraint =
    | ObjectTypeConstraint
    | OptionType<ObjectTypeConstraint>
    | SetType<ObjectTypeConstraint>;
  export type ResolveTypeConstraint = PartialTypeConstraint;
}
