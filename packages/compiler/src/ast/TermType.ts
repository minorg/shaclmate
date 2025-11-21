import type { Literal, NamedNode } from "@rdfjs/types";
import type { BlankNode } from "n3";
import { AbstractTermType } from "./AbstractTermType.js";

/**
 * Term type that is neither an IdentifierType nor a LiteralType. For example, a term type with nodeKinds = Literal | NamedNode.
 */
export class TermType extends AbstractTermType<
  Literal | NamedNode,
  BlankNode | Literal | NamedNode
> {
  readonly kind = "TermType";
}
