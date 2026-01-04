import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Resource } from "rdfjs-resource";
import { Memoize } from "typescript-memoize";
import type * as generated from "./generated.js";
import type { OntologyLike } from "./OntologyLike.js";

export class Ontology implements OntologyLike {
  constructor(
    private readonly generatedOntology: Omit<generated.OwlOntology, "$type">,
  ) {}

  get identifier(): BlankNode | NamedNode {
    return this.generatedOntology.$identifier;
  }

  @Memoize()
  toString(): string {
    return `Ontology(identifier=${Resource.Identifier.toString(this.identifier)})`;
  }
}
