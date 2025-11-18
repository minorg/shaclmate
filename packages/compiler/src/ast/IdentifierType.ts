import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

/**
 * A type corresponding to sh:nodeKind of a blank node or IRI, and not corresponding to a node shape.
 */
export class IdentifierType extends TermType<NamedNode, BlankNode | NamedNode> {
  readonly kind: "IdentifierType";
  readonly nodeKinds: ReadonlySet<IdentifierNodeKind>;
}
