import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_literalSchemaSparqlPatterns } from "./snippets_literalSchemaSparqlPatterns.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_StringFilter } from "./snippets_StringFilter.js";
import { snippets_StringSchema } from "./snippets_StringSchema.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";

export const snippets_stringSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}stringSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}stringSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_StringFilter}, ${snippets_StringSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxLength !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${snippets_literalFactory}.number(filter.maxLength)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minLength !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${snippets_literalFactory}.number(filter.minLength)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${snippets_literalSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
);
