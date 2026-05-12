import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}iriSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.IriFilter}, ${snippets.IriSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter?.in !== undefined && filter.in.length > 0) {
      filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
  };`,
  );
