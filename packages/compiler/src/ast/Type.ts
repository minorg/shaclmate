import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
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
  | ListType
  | LiteralType
  | ObjectIntersectionType
  | ObjectType
  | ObjectUnionType
  | OptionType
  | PlaceholderType
  | SetType
  | (Omit<TermType<BlankNode | Literal | NamedNode>, "kind"> & {
      readonly kind: "TermType";
    })
  | UnionType;
