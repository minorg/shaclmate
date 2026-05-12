import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}iriSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.IriFilter}, ${this.snippets.IriSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${this.snippets.SparqlFilterPattern}[] = [];

    if (filter?.in !== undefined && filter.in.length > 0) {
      filterPatterns.push(${this.snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
    }

    return ${this.snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
  };`,
  );
