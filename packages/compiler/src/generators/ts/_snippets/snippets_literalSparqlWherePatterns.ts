import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.LiteralFilter}, ${snippets.LiteralSchema}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlPatterns({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters });`,
  );
