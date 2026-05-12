import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_BooleanFilter } from "./snippets_BooleanFilter.js";
import { snippets_BooleanSchema } from "./snippets_BooleanSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_booleanSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}booleanSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.BooleanFilter}, ${snippets.BooleanSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.value !== undefined) {
        filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
  }`,
);
