import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
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
