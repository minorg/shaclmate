import type {} from "@rdfjs/types";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import type { LazyObjectSetType } from "./LazyObjectSetType.js";
import type { LazyObjectType } from "./LazyObjectType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { PlaceholderType } from "./PlaceholderType.js";
import type { SetType } from "./SetType.js";
import type { TermType } from "./TermType.js";
import type { UnionType } from "./UnionType.js";

export type Type =
  | IdentifierType
  | IntersectionType
  | LazyObjectOptionType
  | LazyObjectSetType
  | LazyObjectType
  | ListType
  | LiteralType
  | ObjectIntersectionType
  | ObjectType
  | ObjectUnionType
  | OptionType
  | PlaceholderType
  | SetType
  | TermType
  | UnionType;

export namespace Type {
  export function equals(left: Type, right: Type): boolean {
    if (left.kind !== right.kind) {
      return false;
    }

    switch (left.kind) {
      case "IdentifierType":
        return left.equals(right as IdentifierType);
      case "IntersectionType":
        return left.equals(right as IntersectionType);
      case "LiteralType":
        return left.equals(right as LiteralType);
      case "LazyObjectOptionType":
        return left.equals(right as LazyObjectOptionType);
      case "LazyObjectSetType":
        return left.equals(right as LazyObjectSetType);
      case "LazyObjectType":
        return left.equals(right as LazyObjectType);
      case "ListType":
        return left.equals(right as ListType);
      case "ObjectIntersectionType":
        return left.equals(right as ObjectIntersectionType);
      case "ObjectType":
        return left.equals(right as ObjectType);
      case "ObjectUnionType":
        return left.equals(right as ObjectUnionType);
      case "OptionType":
        return left.equals(right as OptionType);
      case "PlaceholderType":
        return left.equals(right as PlaceholderType);
      case "TermType":
        return left.equals(right as TermType);
      case "UnionType":
        return left.equals(right as UnionType);
      case "SetType":
        return left.equals(right as SetType);
    }
  }
}
