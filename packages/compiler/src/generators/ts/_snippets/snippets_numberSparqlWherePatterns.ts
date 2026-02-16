import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_NumberFilter } from "./snippets_NumberFilter.js";
import { snippets_NumberSchema } from "./snippets_NumberSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";
import { snippets_toLiteral } from "./snippets_toLiteral.js";

export const snippets_numberSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}numberSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}numberSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_NumberFilter}, ${snippets_NumberSchema}> =
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
            args: [valueVariable, ${snippets_toLiteral}(filter.maxExclusive)],
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
            args: [valueVariable, ${snippets_toLiteral}(filter.maxInclusive)],
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
            args: [valueVariable, ${snippets_toLiteral}(filter.minExclusive)],
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
            args: [valueVariable, ${snippets_toLiteral}(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
);
