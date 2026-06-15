import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}langStringSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.LiteralFilter}, ${snippets.LangStringSchema}> =
  (parameters) => ${snippets.literalSchemaSparqlPatterns}({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters });`,
  );
