import type { NodeKind } from "./NodeKind.js";

/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type IdentifierNodeKind = Exclude<NodeKind, "Literal">;

export namespace IdentifierNodeKind {
  export function fromTermType(termType: "BlankNode" | "NamedNode"): NodeKind {
    return termType === "NamedNode" ? "IRI" : termType;
  }
}
