import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.BooleanFilter}, ${this.snippets.BooleanSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${this.snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.value !== undefined) {
        filterPatterns.push(${this.snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${this.snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
  }`,
  );
