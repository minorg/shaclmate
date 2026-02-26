import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_NumericFilter } from "./snippets_NumericFilter.js";
import { snippets_NumericSchema } from "./snippets_NumericSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlWherePatternsFunctionParameters } from "./snippets_SparqlWherePatternsFunctionParameters.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_numericSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}numericSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}numericSparqlWherePatterns<T extends bigint | number>({ filter, valueVariable, ...otherParameters }: ${snippets_SparqlWherePatternsFunctionParameters}<${snippets_NumericFilter}<T>, ${snippets_NumericSchema}<T>>): readonly ${snippets_SparqlPattern}[] {
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
          args: [valueVariable, ${snippets_literalFactory}.primitive(filter.maxExclusive)],
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
          args: [valueVariable, ${snippets_literalFactory}.primitive(filter.maxInclusive)],
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
          args: [valueVariable, ${snippets_literalFactory}.primitive(filter.minExclusive)],
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
          args: [valueVariable, ${snippets_literalFactory}.primitive(filter.minInclusive)],
        },
        lift: true,
        type: "filter",
      });
    }
  }

  return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
}`,
);
