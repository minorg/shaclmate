import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_BooleanFilter } from "./snippets_BooleanFilter.js";
import { snippets_BooleanSchema } from "./snippets_BooleanSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_booleanSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}booleanSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_BooleanFilter}, ${snippets_BooleanSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.value !== undefined) {
        filterPatterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
);
