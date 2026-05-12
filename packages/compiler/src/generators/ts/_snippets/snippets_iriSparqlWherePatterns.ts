import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_IriFilter } from "./snippets_IriFilter.js";
import { snippets_IriSchema } from "./snippets_IriSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_iriSparqlWherePatterns = conditionalOutput(
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
