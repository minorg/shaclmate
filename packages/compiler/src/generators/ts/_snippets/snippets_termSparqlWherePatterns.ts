import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termSparqlWherePatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}termSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.TermFilter}<${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>, ${snippets.TermSchema}<${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>> =
  (parameters) => ${snippets.termSchemaSparqlPatterns}({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters })`,
  );
