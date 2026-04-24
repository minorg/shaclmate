import type { NamedNode } from "@rdfjs/types";

/**
 * TypeScript enum corresponding to shaclmate:identifierMintingStrategy, for simpler manipulation.
 */
export type IdentifierMintingStrategy = "blankNode" | "sha256" | "uuidv4";

export namespace IdentifierMintingStrategy {
  export function fromIri(
    iri: NamedNode<
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256"
      | "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4"
    >,
  ) {
    switch (iri.value) {
      case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
        return "blankNode";
      case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256":
        return "sha256";
      case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4":
        return "uuidv4";
      default:
        iri.value satisfies never;
        throw new RangeError(iri.value);
    }
  }
}
