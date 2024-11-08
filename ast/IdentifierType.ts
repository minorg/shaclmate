import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import type { NodeKind } from "shacl-ast";

/**
 * A type corresponding to sh:nodeKind of a blank node or IRI, and not corresponding to a node shape.
 */
export interface IdentifierType {
  readonly hasValue: Maybe<BlankNode | NamedNode>;
  readonly kind: "Identifier";
  readonly nodeKinds: Set<NodeKind.BLANK_NODE | NodeKind.IRI>;
}
