import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_sparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.sparqlWherePatterns`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const sparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.BlankNode_Filter}, ${snippets.BlankNode_Schema}> =
    ({ propertyPatterns }) => propertyPatterns;
}`,
  );
