import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { Type } from "./Type.js";

export class LazyObjectType {
  readonly kind = "LazyObjectType";
  readonly partialType: ObjectType | ObjectUnionType;
  readonly resolvedType: ObjectType | ObjectUnionType;

  constructor({
    partialType,
    resolvedType,
  }: {
    partialType: ObjectType | ObjectUnionType;
    resolvedType: ObjectType | ObjectUnionType;
  }) {
    this.partialType = partialType;
    this.resolvedType = resolvedType;
  }

  equals(other: LazyObjectType): boolean {
    if (!Type.equals(this.partialType, other.partialType)) {
      return false;
    }

    if (!Type.equals(this.resolvedType, other.resolvedType)) {
      return false;
    }

    return true;
  }
}
