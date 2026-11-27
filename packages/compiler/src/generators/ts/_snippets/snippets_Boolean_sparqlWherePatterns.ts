import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_sparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.sparqlWherePatterns`,
    code`\
namespace ${syntheticNamePrefix}Boolean {    
  export const sparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.Boolean_Filter}, ${snippets.Boolean_Schema}<boolean>> =
    ({ filter, valueVariable, ...otherParameters }) => {
      const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

      if (filter) {
        if (filter.value !== undefined) {
          filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
        }
      }

      return ${snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
    }
}`,
  );
