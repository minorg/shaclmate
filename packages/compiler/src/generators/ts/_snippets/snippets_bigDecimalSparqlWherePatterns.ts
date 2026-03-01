import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_bigDecimalLiteral } from "./snippets_bigDecimalLiteral.js";
import { snippets_NumericFilter } from "./snippets_NumericFilter.js";
import { snippets_NumericSchema } from "./snippets_NumericSchema.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlWherePatternsFunctionParameters } from "./snippets_SparqlWherePatternsFunctionParameters.js";

export const snippets_bigDecimalSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}bigDecimalSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}bigDecimalSparqlWherePatterns({ filter, propertyPatterns, schema, valueVariable }: ${snippets_SparqlWherePatternsFunctionParameters}<${snippets_NumericFilter}<${imports.BigDecimal}>, ${snippets_NumericSchema}<${imports.BigDecimal}>>): readonly ${snippets_SparqlPattern}[] {
  const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

  if (filter) {
    if (filter.in !== undefined && filter.in.length > 0) {
      filterPatterns.push({
        expression: {
          args: [valueVariable, filter.in.map(${snippets_bigDecimalLiteral})],
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
          args: [valueVariable, ${snippets_bigDecimalLiteral}(filter.maxExclusive)],
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
          args: [valueVariable, ${snippets_bigDecimalLiteral}(filter.maxInclusive)],
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
          args: [valueVariable, ${snippets_bigDecimalLiteral}(filter.minExclusive)],
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
          args: [valueVariable, ${snippets_bigDecimalLiteral}(filter.minInclusive)],
        },
        lift: true,
        type: "filter",
      });
    }
  }

  const schemaPatterns: ${snippets_SparqlPattern}[] = [];
  if (schema.in && schema.in.length > 0) {
    schemaPatterns.push({
      expression: {
        args: [valueVariable, schema.in.map(${snippets_bigDecimalLiteral})],
        operator: "in",
        type: "operation",
      },
      lift: true,
      type: "filter",
    });
  }

  return (propertyPatterns as readonly ${snippets_SparqlPattern}[]).concat(schemaPatterns).concat(filterPatterns);
}`,
);
