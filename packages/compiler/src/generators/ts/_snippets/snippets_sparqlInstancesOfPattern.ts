import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sparqlInstancesOfPattern: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}sparqlInstancesOfPattern`,
    code`\
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
function ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType, subject }: { rdfType: ${this.imports.NamedNode} | ${this.imports.Variable}, subject: ${this.imports.sparqljs}.Triple["subject"] }): ${this.imports.sparqljs}.BgpPattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            ${this.snippets.RdfVocabularies}.rdf.type,
            {
              items: [${this.snippets.RdfVocabularies}.rdfs.subClassOf],
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
