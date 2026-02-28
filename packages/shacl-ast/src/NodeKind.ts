/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type NodeKind = "BlankNode" | "IRI" | "Literal";

export namespace NodeKind {
  export function fromTermType(
    termType: "BlankNode" | "Literal" | "NamedNode",
  ): NodeKind {
    return termType === "NamedNode" ? "IRI" : termType;
  }

  export function toTermType(
    nodeKind: NodeKind,
  ): "BlankNode" | "Literal" | "NamedNode" {
    return nodeKind === "IRI" ? "NamedNode" : nodeKind;
  }
}
