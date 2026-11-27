import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_sparqlWherePatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.sparqlWherePatterns`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const sparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.NumericFilter}<${imports.BigDecimal}>, ${snippets.NumericSchema}<${imports.BigDecimal}>> = ({ filter, propertyPatterns, schema, valueVariable }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.in !== undefined && filter.in.length > 0) {
        filterPatterns.push({
          expression: {
            args: [valueVariable, filter.in.map(value => ${snippets.literalFactory}.bigdecimal(value))],
            operator: "in",
            type: "operation",
          },
          lift: true,
          type: "filter",
        });
      }

      if (filter.maxExclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${snippets.literalFactory}.bigdecimal(filter.maxExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (filter.maxInclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${snippets.literalFactory}.bigdecimal(filter.maxInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (filter.minExclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${snippets.literalFactory}.bigdecimal(filter.minExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (filter.minInclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${snippets.literalFactory}.bigdecimal(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    const schemaPatterns: ${snippets.SparqlPattern}[] = [];
    if (schema.in && schema.in.length > 0) {
      schemaPatterns.push({
        expression: {
          args: [valueVariable, schema.in.map(value => ${snippets.literalFactory}.bigdecimal(value))],
          operator: "in",
          type: "operation",
        },
        lift: true,
        type: "filter",
      });
    }

    return (propertyPatterns as readonly ${snippets.SparqlPattern}[]).concat(schemaPatterns).concat(filterPatterns);
  }
}`,
  );
