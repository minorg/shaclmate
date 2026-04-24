import type { NamedNode } from "@rdfjs/types";

export type Visibility = "private" | "protected" | "public";

export namespace Visibility {
  export function fromIri(
    iri: NamedNode<
      | "http://purl.org/shaclmate/ontology#_Visibility_Private"
      | "http://purl.org/shaclmate/ontology#_Visibility_Protected"
      | "http://purl.org/shaclmate/ontology#_Visibility_Public"
    >,
  ): Visibility {
    switch (iri.value) {
      case "http://purl.org/shaclmate/ontology#_Visibility_Private":
        return "private";
      case "http://purl.org/shaclmate/ontology#_Visibility_Protected":
        return "protected";
      case "http://purl.org/shaclmate/ontology#_Visibility_Public":
        return "public";
      default:
        throw new RangeError(iri.value);
    }
  }
}
