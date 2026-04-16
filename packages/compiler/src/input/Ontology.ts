import { Ontology as ShaclAstOntology } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { TsObjectDeclarationType } from "../enums/TsObjectDeclarationType.js";
import type * as generated from "./generated.js";

export class Ontology extends ShaclAstOntology {
  constructor(private readonly _generatedOntology: generated.Ontology) {
    super(_generatedOntology);
  }

  get tsFeatureExcludes() {
    return this._generatedOntology.tsFeatureExcludes;
  }

  get tsFeatureIncludes() {
    return this._generatedOntology.tsFeatureIncludes;
  }

  get tsImports(): readonly string[] {
    return this._generatedOntology.tsImports;
  }

  @Memoize()
  get tsObjectDeclarationType(): Maybe<TsObjectDeclarationType> {
    return this._generatedOntology.tsObjectDeclarationType.map((iri) => {
      switch (iri.value) {
        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
          return "class";
        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
          return "interface";
        default:
          throw new RangeError(iri.value);
      }
    });
  }
}
