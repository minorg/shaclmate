import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.TermFilter}, ${snippets.TermSchema}> =
  (parameters) => ${snippets.termSchemaSparqlPatterns}({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters })`,
  );
