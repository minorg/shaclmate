import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";

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
}
