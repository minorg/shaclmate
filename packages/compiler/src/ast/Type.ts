import type { BlankNodeType } from "./BlankNodeType.js";
import type { DefaultValueType } from "./DefaultValueType.js";
import type { DiscriminatedUnionType } from "./DiscriminatedUnionType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LazyOptionType } from "./LazyOptionType.js";
import type { LazySetType } from "./LazySetType.js";
import type { LazyType } from "./LazyType.js";
import type { ListType } from "./ListType.js";
import type { LiteralType } from "./LiteralType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { StructType } from "./StructType.js";
import type { TermType } from "./TermType.js";

export type Type =
  | BlankNodeType
  | DefaultValueType
  | IdentifierType
  | IntersectionType
  | IriType
  | LazyOptionType
  | LazySetType
  | LazyType
  | ListType
  | LiteralType
  | StructType
  | OptionType
  | SetType
  | TermType
  | DiscriminatedUnionType;

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
      case "LazyOption":
        return left.equals(right as LazyOptionType);
      case "LazySet":
        return left.equals(right as LazySetType);
      case "Lazy":
        return left.equals(right as LazyType);
      case "List":
        return left.equals(right as ListType);
      case "Struct":
        return left.equals(right as StructType);
      case "Option":
        return left.equals(right as OptionType);
      case "Term":
        return left.equals(right as TermType);
      case "DiscriminatedUnion":
        return left.equals(right as DiscriminatedUnionType);
      case "Set":
        return left.equals(right as SetType);
    }
  }
}
