import type { BlankNode, NamedNode } from "@rdfjs/types";
import { AbstractTermType } from "./AbstractTermType.js";

const nodeKinds: ReadonlySet<"BlankNode"> = new Set(["BlankNode"]);

/**
 * A type corresponding to sh:nodeKind sh:BlankNode.
 */
export class BlankNodeType extends AbstractTermType<NamedNode, BlankNode> {
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
      nodeKinds,
    });
  }

  override readonly kind = "BlankNodeType";
}
