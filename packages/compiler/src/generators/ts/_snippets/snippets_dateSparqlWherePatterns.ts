import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_DateFilter } from "./snippets_DateFilter.js";
import { snippets_DateSchema } from "./snippets_DateSchema.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_RdfVocabularies } from "./snippets_RdfVocabularies.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";

export const snippets_dateSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}dateSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}dateSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_DateFilter}, ${snippets_DateSchema}> =
  ({ filter, schema, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets_SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "in",
            args: [valueVariable, filter.in.map(inValue => ${snippets_literalFactory}.date(inValue, schema.kind === "Date" ? ${snippets_RdfVocabularies}.xsd.date : ${snippets_RdfVocabularies}.xsd.dateTime))],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${snippets_literalFactory}.date(filter.maxExclusive, schema.kind === "Date" ? ${snippets_RdfVocabularies}.xsd.date : ${snippets_RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.maxInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${snippets_literalFactory}.date(filter.maxInclusive, schema.kind === "Date" ? ${snippets_RdfVocabularies}.xsd.date : ${snippets_RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.minExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${snippets_literalFactory}.date(filter.minExclusive, schema.kind === "Date" ? ${snippets_RdfVocabularies}.xsd.date : ${snippets_RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (typeof filter.minInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${snippets_literalFactory}.date(filter.minInclusive, schema.kind === "Date" ? ${snippets_RdfVocabularies}.xsd.date : ${snippets_RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }
    }

    return ${snippets_termSchemaSparqlPatterns}({ filterPatterns, schema, valueVariable, ...otherParameters });
  }`,
);
