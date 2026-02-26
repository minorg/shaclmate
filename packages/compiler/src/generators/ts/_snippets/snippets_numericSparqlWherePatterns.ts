import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_NumericFilter } from "./snippets_NumericFilter.js";
import { snippets_NumericSchema } from "./snippets_NumericSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_numericSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}numericSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}numericSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_NumericFilter}, ${snippets_NumericSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${snippets_literalFactory}.number(filter.maxExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.maxInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${snippets_literalFactory}.number(filter.maxInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${snippets_literalFactory}.number(filter.minExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${snippets_literalFactory}.number(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
);
