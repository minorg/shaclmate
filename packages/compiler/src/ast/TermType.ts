import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { NodeKind } from "@shaclmate/shacl-ast";

import { invariant } from "ts-invariant";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * Term type that is neither an IdentifierType nor a LiteralType. For example, a term type with nodeKinds = Literal | NamedNode.
 */
export class TermType extends AbstractTermType<
  Literal | NamedNode,
  BlankNode | Literal | NamedNode
> {
  override readonly kind = "TermType";
  override readonly nodeKinds: ReadonlySet<NodeKind>;

  constructor({
    nodeKinds,
    ...superParameters
  }: ConstructorParameters<
    typeof AbstractTermType<
      Literal | NamedNode,
      BlankNode | Literal | NamedNode
    >
  >[0] & {
    nodeKinds: ReadonlySet<NodeKind>;
  }) {
    super(superParameters);
    this.nodeKinds = nodeKinds;
    invariant(
      this.nodeKinds.has("Literal") &&
        (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("IRI")),
      "should be IdentifierType or LiteralType",
    );
  }
}
