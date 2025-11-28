import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";

export class LazyObjectOptionType {
  readonly kind = "LazyObjectOptionType";
  readonly partialType: OptionType<ObjectType | ObjectUnionType>;
  readonly resolvedType: OptionType<ObjectType | ObjectUnionType>;

  constructor({
    partialType,
    resolvedType,
  }: {
    partialType: OptionType<ObjectType | ObjectUnionType>;
    resolvedType: OptionType<ObjectType | ObjectUnionType>;
  }) {
    this.partialType = partialType;
    this.resolvedType = resolvedType;
  }
}
