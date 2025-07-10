import type * as rdfjs from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type { TsFeature } from "../enums/index.js";

type TsFeatureIri = rdfjs.NamedNode<
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

function iriToTsFeatures(iri: TsFeatureIri): readonly TsFeature[] {
  switch (iri.value) {
    case "http://purl.org/shaclmate/ontology#_TsFeatures_All":
      return tsFeaturesAll;
    case "http://purl.org/shaclmate/ontology#_TsFeature_Create":
      return ["create"];
    case "http://purl.org/shaclmate/ontology#_TsFeatures_Default":
      return tsFeaturesDefault;
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

export function tsFeatures(generated: {
  readonly tsFeatureExcludes: readonly TsFeatureIri[];
  readonly tsFeatureIncludes: readonly TsFeatureIri[];
}): Maybe<Set<TsFeature>> {
  const tsFeatureIncludes =
    generated.tsFeatureIncludes.flatMap(iriToTsFeatures);
  const tsFeatureExcludes =
    generated.tsFeatureExcludes.flatMap(iriToTsFeatures);

  if (tsFeatureExcludes.length === 0 && tsFeatureIncludes.length === 0) {
    return Maybe.empty();
  }

  const tsFeatures = new Set<TsFeature>();

  if (tsFeatureIncludes.length > 0) {
    for (const tsFeatureInclude of tsFeatureIncludes) {
      tsFeatures.add(tsFeatureInclude);
    }
  } else {
    for (const tsFeature of tsFeaturesDefault) {
      tsFeatures.add(tsFeature);
    }
  }

  for (const tsFeatureExclude of tsFeatureExcludes) {
    tsFeatures.delete(tsFeatureExclude);
  }

  if (tsFeatures.has("graphql")) {
    tsFeatures.add("rdf");
  }

  return Maybe.of(tsFeatures);
}

const tsFeaturesAll: readonly TsFeature[] = [
  "create",
  "equals",
  "graphql",
  "hash",
  "json",
  "rdf",
  "sparql",
];

export const tsFeaturesDefault: readonly TsFeature[] = [
  "create",
  "equals",
  "hash",
  "json",
  "rdf",
];
