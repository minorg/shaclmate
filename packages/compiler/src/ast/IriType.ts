import type { NamedNode } from "@rdfjs/types";
import { AbstractTermType } from "./AbstractTermType.js";

const nodeKinds: ReadonlySet<"NamedNode"> = new Set(["NamedNode"]);

/**
 * A type corresponding to sh:nodeKind sh:IRI.
 */
export class IriType extends AbstractTermType<NamedNode, NamedNode> {
  constructor(
    superParameters: Omit<
      ConstructorParameters<typeof AbstractTermType<NamedNode, NamedNode>>[0],
      "nodeKinds"
    >,
  ) {
    super({
      ...superParameters,
      nodeKinds,
    });
  }

  override readonly kind = "IriType";
}
