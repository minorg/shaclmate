import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { SetType } from "./SetType.js";

export class LazyObjectSetType {
  readonly kind = "LazyObjectSetType";
  readonly partialType: SetType<ObjectType | ObjectUnionType>;
  readonly resolvedType: SetType<ObjectType | ObjectUnionType>;

  constructor({
    partialType,
    resolvedType,
  }: {
    partialType: SetType<ObjectType | ObjectUnionType>;
    resolvedType: SetType<ObjectType | ObjectUnionType>;
  }) {
    this.partialType = partialType;
    this.resolvedType = resolvedType;
  }
}
