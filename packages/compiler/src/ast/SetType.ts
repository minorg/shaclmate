import { CollectionType } from "./CollectionType.js";
import type { Type } from "./Type.js";

/**
 * An unordered set of items of a specific type.
 */
export abstract class SetType<
  ItemTypeT extends Type = Type,
> extends CollectionType<ItemTypeT> {
  readonly kind = "SetType";

  /**
   * Minimum number of items in the set.
   */
  readonly minCount: number;

  constructor({
    minCount,
    ...superParameters
  }: { minCount: number } & ConstructorParameters<
    typeof CollectionType<ItemTypeT>
  >[0]) {
    super(superParameters);
    this.minCount = minCount;
  }
}
