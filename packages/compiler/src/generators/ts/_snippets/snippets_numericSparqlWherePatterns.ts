import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_numericSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}numericSparqlWherePatterns`,
    code`\
function $numericSparqlWherePatterns<T extends bigint | number>({ filter, valueVariable, ...otherParameters }: Parameters<${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.NumericFilter}<T>, ${this.snippets.NumericSchema}<T>>>[0]): ReturnType<${this.snippets.ValueSparqlWherePatternsFunction}<${this.snippets.NumericFilter}<T>, ${this.snippets.NumericSchema}<T>>> {
  const filterPatterns: ${this.snippets.SparqlFilterPattern}[] = [];

  if (filter) {
    if (filter.in !== undefined && filter.in.length > 0) {
      filterPatterns.push(${this.snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
    }

    if (filter.maxExclusive !== undefined) {
      filterPatterns.push({
        expression: {
          type: "operation",
          operator: "<",
          args: [valueVariable, ${this.snippets.literalFactory}.primitive(filter.maxExclusive)],
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
          args: [valueVariable, ${this.snippets.literalFactory}.primitive(filter.maxInclusive)],
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
          args: [valueVariable, ${this.snippets.literalFactory}.primitive(filter.minExclusive)],
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
          args: [valueVariable, ${this.snippets.literalFactory}.primitive(filter.minInclusive)],
        },
        lift: true,
        type: "filter",
      });
    }
  }

  return ${this.snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, valueVariable });
}`,
  );
