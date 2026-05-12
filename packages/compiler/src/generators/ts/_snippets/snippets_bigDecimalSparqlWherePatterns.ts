import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalSparqlWherePatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}bigDecimalSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.NumericFilter}<${this.imports.BigDecimal}>, ${this.snippets.NumericSchema}<${this.imports.BigDecimal}>> = ({ filter, propertyPatterns, schema, valueVariable }) => {
  const filterPatterns: ${this.snippets.SparqlFilterPattern}[] = [];

  if (filter) {
    if (filter.in !== undefined && filter.in.length > 0) {
      filterPatterns.push({
        expression: {
          args: [valueVariable, filter.in.map(${this.snippets.bigDecimalLiteral})],
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
          args: [valueVariable, ${this.snippets.bigDecimalLiteral}(filter.maxExclusive)],
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
          args: [valueVariable, ${this.snippets.bigDecimalLiteral}(filter.maxInclusive)],
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
          args: [valueVariable, ${this.snippets.bigDecimalLiteral}(filter.minExclusive)],
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
          args: [valueVariable, ${this.snippets.bigDecimalLiteral}(filter.minInclusive)],
        },
        lift: true,
        type: "filter",
      });
    }
  }

  const schemaPatterns: ${this.snippets.SparqlPattern}[] = [];
  if (schema.in && schema.in.length > 0) {
    schemaPatterns.push({
      expression: {
        args: [valueVariable, schema.in.map(${this.snippets.bigDecimalLiteral})],
        operator: "in",
        type: "operation",
      },
      lift: true,
      type: "filter",
    });
  }

  return (propertyPatterns as readonly ${this.snippets.SparqlPattern}[]).concat(schemaPatterns).concat(filterPatterns);
}`,
  );
