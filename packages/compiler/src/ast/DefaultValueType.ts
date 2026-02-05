import type { Literal, NamedNode } from "@rdfjs/types";
import { AbstractContainerType } from "./AbstractContainerType.js";
import { termEquals } from "./equals.js";

/**
 * A type with an sh:defaultValue.
 *
 * This type is a hybrid of OptionType and a required (item) type like LiteralType.
 *
 * It's declared like the required type but is optional on deserialization/query since a default value
 * can be substituted when one has not been supplied.
 */
export class DefaultValueType<
  ItemTypeT extends DefaultValueType.ItemType = DefaultValueType.ItemType,
> extends AbstractContainerType<ItemTypeT> {
  readonly defaultValue: Literal | NamedNode;
  readonly kind = "DefaultValueType";

  constructor({
    defaultValue,
    itemType,
  }: Pick<
    ConstructorParameters<typeof AbstractContainerType<ItemTypeT>>[0],
    "itemType"
  > & { defaultValue: Literal | NamedNode }) {
    super({
      comment: itemType.comment,
      itemType,
      label: itemType.label,
    });
    this.defaultValue = defaultValue;
  }

  override equals(other: DefaultValueType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!termEquals(this.defaultValue, other.defaultValue)) {
      return false;
    }

    return true;
  }
}

export namespace DefaultValueType {
  export type ItemType = AbstractContainerType.ItemType;
  export const isItemType = AbstractContainerType.isItemType;
}
