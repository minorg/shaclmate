import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { OntologyLike } from "./OntologyLike.js";
import type * as generated from "./generated.js";

export class Ontology implements OntologyLike {
  constructor(
    private readonly generatedOntology: Omit<generated.OwlOntology, "$type">,
  ) {}

  get identifier(): BlankNode | NamedNode {
    return this.generatedOntology.$identifier;
  }

  toString(): string {
    return `Ontology(node=${this.identifier.value})`;
  }
}
