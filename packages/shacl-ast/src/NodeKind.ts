import type { NamedNode } from "@rdfjs/types";

/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type NodeKind = "BlankNode" | "IRI" | "Literal";

export namespace NodeKind {
  export function fromIri(
    iri: NamedNode<
      | "http://www.w3.org/ns/shacl#BlankNode"
      | "http://www.w3.org/ns/shacl#BlankNodeOrIRI"
      | "http://www.w3.org/ns/shacl#BlankNodeOrLiteral"
      | "http://www.w3.org/ns/shacl#IRI"
      | "http://www.w3.org/ns/shacl#IRIOrLiteral"
      | "http://www.w3.org/ns/shacl#Literal"
    >,
  ): ReadonlySet<NodeKind> {
    const nodeKinds = new Set<NodeKind>();
    switch (iri.value) {
      case "http://www.w3.org/ns/shacl#BlankNode":
        nodeKinds.add("BlankNode");
        break;
      case "http://www.w3.org/ns/shacl#BlankNodeOrIRI":
        nodeKinds.add("BlankNode");
        nodeKinds.add("IRI");
        break;
      case "http://www.w3.org/ns/shacl#BlankNodeOrLiteral":
        nodeKinds.add("BlankNode");
        nodeKinds.add("Literal");
        break;
      case "http://www.w3.org/ns/shacl#IRI":
        nodeKinds.add("IRI");
        break;
      case "http://www.w3.org/ns/shacl#IRIOrLiteral":
        nodeKinds.add("IRI");
        nodeKinds.add("Literal");
        break;
      case "http://www.w3.org/ns/shacl#Literal":
        nodeKinds.add("Literal");
        break;
      default:
        iri.value satisfies never;
        throw new RangeError(iri.value);
    }
    return nodeKinds;
  }

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
