import { Ontology as OwlOntology } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { TsFeature, TsObjectDeclarationType } from "../enums/index.js";
import type * as generated from "./generated.js";
import { tsFeatures } from "./tsFeatures.js";

export class Ontology extends OwlOntology {
  constructor(
    private readonly generatedShaclmateOntology: generated.ShaclmateOntology,
  ) {
    super(generatedShaclmateOntology);
  }

  @Memoize()
  get tsFeatures(): Maybe<ReadonlySet<TsFeature>> {
    return tsFeatures(this.generatedShaclmateOntology);
  }

  get tsImports(): readonly string[] {
    return this.generatedShaclmateOntology.tsImports;
  }

  @Memoize()
  get tsObjectDeclarationType(): Maybe<TsObjectDeclarationType> {
    return this.generatedShaclmateOntology.tsObjectDeclarationType.map(
      (iri) => {
        switch (iri.value) {
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
            return "class";
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
            return "interface";
          default:
            throw new RangeError(iri.value);
        }
      },
    );
  }
}
