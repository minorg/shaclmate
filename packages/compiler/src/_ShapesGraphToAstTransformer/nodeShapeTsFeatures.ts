import type { NamedNode } from "@rdfjs/types";
import { Either } from "purify-ts";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

type TsFeatureIri = NamedNode<
  | "http://purl.org/shaclmate/ontology#_TsFeatures_All"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Create"
  | "http://purl.org/shaclmate/ontology#_TsFeatures_Default"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Equals"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Graphql"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Json"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Hash"
  | "http://purl.org/shaclmate/ontology#_TsFeatures_None"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Rdf"
  | "http://purl.org/shaclmate/ontology#_TsFeature_Sparql"
>;

const tsFeaturesAll: readonly TsFeature[] = [
  "create",
  "equals",
  "graphql",
  "hash",
  "json",
  "rdf",
  "sparql",
];

export function nodeShapeTsFeatures(
  this: ShapesGraphToAstTransformer,
  nodeShape: input.NodeShape,
): Either<Error, ReadonlySet<TsFeature>> {
  const tsFeaturesDefault = this.tsFeaturesDefault;
  function iriToTsFeatures(iri: TsFeatureIri): readonly TsFeature[] {
    switch (iri.value) {
      case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
        return tsFeaturesAll;
      case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
        return ["create"];
      case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
        return [...tsFeaturesDefault];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Equals":
        return ["equals"];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Graphql":
        return ["graphql"];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Json":
        return ["json"];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Rdf":
        return ["rdf"];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Hash":
        return ["hash"];
      case "http://purl.org/shaclmate/ontology#_TsFeatures_None":
        return [];
      case "http://purl.org/shaclmate/ontology#_TsFeature_Sparql":
        return ["sparql"];
    }
  }

  return nodeShape.isDefinedBy.chain((ontologyMaybe) => {
    let tsFeatureExcludes =
      nodeShape.tsFeatureExcludes.flatMap(iriToTsFeatures);
    let tsFeatureIncludes =
      nodeShape.tsFeatureIncludes.flatMap(iriToTsFeatures);

    if (tsFeatureExcludes.length === 0 && tsFeatureIncludes.length === 0) {
      ontologyMaybe.ifJust((ontology) => {
        tsFeatureExcludes = ontology.tsFeatureExcludes.flatMap(iriToTsFeatures);
        tsFeatureIncludes = ontology.tsFeatureIncludes.flatMap(iriToTsFeatures);
      });
    }

    const tsFeatures = new Set<TsFeature>();

    if (tsFeatureIncludes.length > 0) {
      for (const tsFeatureInclude of tsFeatureIncludes) {
        tsFeatures.add(tsFeatureInclude);
      }
    } else {
      for (const tsFeature of this.tsFeaturesDefault) {
        tsFeatures.add(tsFeature);
      }
    }

    for (const tsFeatureExclude of tsFeatureExcludes) {
      tsFeatures.delete(tsFeatureExclude);
    }

    if (tsFeatures.size === 0) {
      for (const tsFeature of tsFeaturesDefault) {
        tsFeatures.add(tsFeature);
      }
    }

    if (tsFeatures.has("graphql")) {
      tsFeatures.add("rdf");
    }

    return Either.of(tsFeatures);
  });
}
