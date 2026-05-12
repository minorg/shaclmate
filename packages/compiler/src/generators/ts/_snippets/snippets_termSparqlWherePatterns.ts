import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.TermFilter}, ${this.snippets.TermSchema}> =
  (parameters) => ${this.snippets.termSchemaSparqlPatterns}({ filterPatterns: ${this.snippets.termFilterSparqlPatterns}(parameters), ...parameters })`,
  );
