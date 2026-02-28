import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * A type corresponding to sh:nodeKind of a blank node or IRI, and not corresponding to a node shape.
 */
export class IdentifierType extends AbstractTermType<
  NamedNode,
  BlankNode | NamedNode
> {
  override readonly kind = "IdentifierType";
  override readonly nodeKinds = nodeKinds;

  constructor(
    superParameters: Pick<
      ConstructorParameters<typeof AbstractTermType<NamedNode, BlankNode>>[0],
      "comment" | "label"
    >,
  ) {
    super({
      ...superParameters,
      hasValues: [],
      in_: [],
    });
  }
}

const nodeKinds: ReadonlySet<IdentifierNodeKind> = new Set([
  "BlankNode",
  "IRI",
]);
