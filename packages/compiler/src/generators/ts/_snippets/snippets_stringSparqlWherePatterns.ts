import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_literalSchemaSparqlPatterns } from "./snippets_literalSchemaSparqlPatterns.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_StringFilter } from "./snippets_StringFilter.js";
import { snippets_StringSchema } from "./snippets_StringSchema.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_stringSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}stringSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}stringSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.StringFilter}, ${snippets.StringSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.in !== undefined && filter.in.length > 0) {
        filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (filter.maxLength !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${snippets.literalFactory}.number(filter.maxLength)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (filter.minLength !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${snippets.literalFactory}.number(filter.minLength)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${snippets.literalSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
  }`,
);
