import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.LiteralFilter}, ${this.snippets.LiteralSchema}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlPatterns({ filterPatterns: ${this.snippets.termFilterSparqlPatterns}(parameters), ...parameters });`,
  );
