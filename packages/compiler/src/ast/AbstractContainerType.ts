import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { NamedNodeType } from "./NamedNodeType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { PlaceholderType } from "./PlaceholderType.js";
import type { TermType } from "./TermType.js";
import { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

/**
 * Abstract base class for types that contain other types e.g., ListType, OptionType, SetType.
 */
export abstract class AbstractContainerType<
  ItemTypeT extends
    AbstractContainerType.ItemType = AbstractContainerType.ItemType,
> extends AbstractType {
  abstract readonly kind:
    | "DefaultValueType"
    | "ListType"
    | "OptionType"
    | "SetType";

  /**
   * Container item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: ItemTypeT;

  constructor({
    itemType,
    ...superParameters
  }: {
    itemType: ItemTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.itemType = itemType;
  }

  override equals(other: AbstractContainerType<ItemTypeT>): boolean {
    if (!super.equals(other)) {
      return false;
    }

    if (!Type.equals(this.itemType, other.itemType)) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `${this.kind}(itemType=${this.itemType})`;
  }
}

export namespace AbstractContainerType {
  export type ItemType =
    | BlankNodeType
    | IdentifierType
    | IntersectionType
    | ListType
    | LiteralType
    | NamedNodeType
    | ObjectIntersectionType
    | ObjectType
    | ObjectUnionType
    | PlaceholderType
    | TermType
    | UnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BlankNodeType":
      case "IdentifierType":
      case "IntersectionType":
      case "ListType":
      case "LiteralType":
      case "NamedNodeType":
      case "ObjectIntersectionType":
      case "ObjectType":
      case "ObjectUnionType":
      case "TermType":
      case "UnionType":
        return true;
      case "DefaultValueType":
      case "LazyObjectOptionType":
      case "LazyObjectSetType":
      case "LazyObjectType":
      case "OptionType":
      case "SetType":
        return false;
      case "PlaceholderType":
        throw new Error("should never happen");
    }
  }
}
