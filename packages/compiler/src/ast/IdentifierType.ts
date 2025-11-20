import type { BlankNode, NamedNode } from "@rdfjs/types";
import { AbstractTermType } from "./AbstractTermType.js";

/**
 * A type corresponding to sh:nodeKind of a blank node or IRI, and not corresponding to a node shape.
 */
export class IdentifierType extends AbstractTermType<
  NamedNode,
  BlankNode | NamedNode
> {
  override readonly kind = "IdentifierType";
}
