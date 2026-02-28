import type { BlankNode, NamedNode } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * A type corresponding to sh:nodeKind sh:BlankNode.
 */
export class BlankNodeType extends AbstractTermType<NamedNode, BlankNode> {
  override readonly kind = "BlankNodeType";
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

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);
