import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { PlainType } from "./PlainType.js";
import type { SetType } from "./SetType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

/**
 * Base interface for types that enforce cardinality.
 */
export interface CardinalityType<ItemTypeT extends CardinalityType.ItemType> {
  readonly itemType: ItemTypeT;
  readonly kind: "OptionType" | "PlainType" | "SetType";
}

export namespace CardinalityType {
  export function isCardinalityType(
    type: Type,
  ): type is
    | OptionType<CardinalityType.ItemType>
    | PlainType<CardinalityType.ItemType>
    | SetType<CardinalityType.ItemType> {
    switch (type.kind) {
      case "OptionType":
      case "PlainType":
      case "SetType":
        return true;
      default:
        return false;
    }
  }

  export type ItemType =
    | IdentifierType
    | IntersectionType
    | ListType
    | LiteralType
    | ObjectIntersectionType
    | ObjectUnionType
    | ObjectType
    | (Omit<
        TermType<Literal | NamedNode, BlankNode | Literal | NamedNode>,
        "kind"
      > & {
        readonly kind: "TermType";
      })
    | UnionType;
}
