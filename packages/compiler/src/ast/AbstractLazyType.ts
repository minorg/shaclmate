import type { NodeKind } from "@shaclmate/shacl-ast";

import { AbstractType } from "./AbstractType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { StructType } from "./StructType.js";
import type { StructUnionType } from "./StructUnionType.js";
import { Type } from "./Type.js";

/**
 * Abstract base class of LazyOptionType, LazySetType, and LazyType.
 */
export abstract class AbstractLazyType<
  PartialTypeT extends AbstractLazyType.PartialTypeConstraint,
  ResolveTypeT extends AbstractLazyType.ResolveTypeConstraint,
> extends AbstractType {
  abstract override readonly kind: "Lazy" | "LazyOption" | "LazySet";
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

  override get nodeKinds(): ReadonlySet<NodeKind> {
    return this.partialType.nodeKinds;
  }

  override get recursive(): boolean {
    return this.partialType.recursive;
  }

  override equals(
    other: AbstractLazyType<PartialTypeT, ResolveTypeT>,
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

  override toJSON() {
    return {
      ...super.toJSON(),
      partialType: this.partialType.toJSON(),
      resolveType: this.resolveType.toJSON(),
    };
  }
}

export namespace AbstractLazyType {
  export type ItemTypeConstraint = StructType | StructUnionType;
  export type PartialTypeConstraint =
    | ItemTypeConstraint
    | OptionType<ItemTypeConstraint>
    | SetType<ItemTypeConstraint>;
  export type ResolveTypeConstraint = PartialTypeConstraint;
}
