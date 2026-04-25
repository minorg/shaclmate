import type { NamedNode } from "@rdfjs/types";

/**
 * TypeScript enum corresponding to shaclmate:tsObjectDeclarationType, for simpler manipulation.
 */
export type TsObjectDeclarationType = "class" | "interface";

export namespace TsObjectDeclarationType {
  export function fromIri(
    iri: NamedNode<
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class"
      | "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface"
    >,
  ): TsObjectDeclarationType {
    switch (iri.value) {
      case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
        return "class";
      case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
        return "interface";
      default:
        iri.value satisfies never;
        throw new RangeError(iri.value);
    }
  }
}
