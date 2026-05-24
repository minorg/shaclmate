import type { BlankNodeType } from "./BlankNodeType.js";
import type { DefaultValueType } from "./DefaultValueType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LazyObjectOptionType } from "./LazyObjectOptionType.js";
import type { LazyObjectSetType } from "./LazyObjectSetType.js";
import type { LazyObjectType } from "./LazyObjectType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { TermType } from "./TermType.js";
import type { UnionType } from "./UnionType.js";

export type Type =
  | BlankNodeType
  | DefaultValueType
  | IdentifierType
  | IntersectionType
  | IriType
  | LazyObjectOptionType
  | LazyObjectSetType
  | LazyObjectType
  | ListType
  | LiteralType
  | ObjectType
  | OptionType
  | SetType
  | TermType
  | UnionType;

export namespace Type {
  export function equals(left: Type, right: Type): boolean {
    if (left.kind !== right.kind) {
      return false;
    }

    switch (left.kind) {
      case "BlankNode":
        return left.equals(right as BlankNodeType);
      case "DefaultValue":
        return left.equals(right as DefaultValueType);
      case "Identifier":
        return left.equals(right as IdentifierType);
      case "Intersection":
        return left.equals(right as IntersectionType);
      case "Iri":
        return left.equals(right as IriType);
      case "Literal":
        return left.equals(right as LiteralType);
      case "LazyObjectOption":
        return left.equals(right as LazyObjectOptionType);
      case "LazyObjectSet":
        return left.equals(right as LazyObjectSetType);
      case "LazyObject":
        return left.equals(right as LazyObjectType);
      case "List":
        return left.equals(right as ListType);
      case "Object":
        return left.equals(right as ObjectType);
      case "Option":
        return left.equals(right as OptionType);
      case "Term":
        return left.equals(right as TermType);
      case "Union":
        return left.equals(right as UnionType);
      case "Set":
        return left.equals(right as SetType);
    }
  }
}
