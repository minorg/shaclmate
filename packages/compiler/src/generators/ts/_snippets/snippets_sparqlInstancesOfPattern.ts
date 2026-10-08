import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sparqlInstancesOfPattern: SnippetFactory = ({
  imports,
  rdfjsTermExpression,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
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
            ${rdfjsTermExpression(rdf.type)},
            {
              items: [${rdfjsTermExpression(rdfs.subClassOf)}],
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
