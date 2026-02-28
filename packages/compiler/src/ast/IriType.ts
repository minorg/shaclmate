import type { NamedNode } from "@rdfjs/types";

import { AbstractTermType } from "./AbstractTermType.js";

/**
 * A type corresponding to sh:nodeKind sh:IRI.
 */
export class IriType extends AbstractTermType<NamedNode, NamedNode> {
  override readonly kind = "IriType";
  override readonly nodeKinds = nodeKinds;
}

const nodeKinds: ReadonlySet<"IRI"> = new Set(["IRI"]);
