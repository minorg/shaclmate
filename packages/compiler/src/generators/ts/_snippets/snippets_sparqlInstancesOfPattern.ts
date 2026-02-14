import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_RdfVocabularies } from "./snippets_RdfVocabularies.js";

export const snippets_sparqlInstancesOfPattern = conditionalOutput(
  `${syntheticNamePrefix}sparqlInstancesOfPattern`,
  code`\
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
function ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType, subject }: { rdfType: ${imports.NamedNode} | ${imports.Variable}, subject: ${imports.sparqljs}.Triple["subject"] }): ${imports.sparqljs}.BgpPattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            ${snippets_RdfVocabularies}.rdf.type,
            {
              items: [${snippets_RdfVocabularies}.rdfs.subClassOf],
              pathType: "*",
              type: "path",
            },
          ],
          pathType: "/",
          type: "path",
        },
        object: rdfType,
      },
    ],
    type: "bgp",
  };
}`,
);
