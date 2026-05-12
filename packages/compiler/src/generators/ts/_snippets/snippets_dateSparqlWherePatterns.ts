import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_DateFilter } from "./snippets_DateFilter.js";
import { snippets_DateSchema } from "./snippets_DateSchema.js";
import { snippets_literalFactory } from "./snippets_literalFactory.js";
import { snippets_RdfVocabularies } from "./snippets_RdfVocabularies.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_termSchemaSparqlPatterns } from "./snippets_termSchemaSparqlPatterns.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_dateSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}dateSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}dateSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.DateFilter}, ${snippets.DateSchema}> =
  ({ filter, schema, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (filter.in !== undefined && filter.in.length > 0) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "in",
            args: [valueVariable, filter.in.map(inValue => ${snippets.literalFactory}.date(inValue, schema.kind === "Date" ? ${snippets.RdfVocabularies}.xsd.date : ${snippets.RdfVocabularies}.xsd.dateTime))],
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
            args: [valueVariable, ${snippets.literalFactory}.date(filter.maxExclusive, schema.kind === "Date" ? ${snippets.RdfVocabularies}.xsd.date : ${snippets.RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (filter.maxInclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${snippets.literalFactory}.date(filter.maxInclusive, schema.kind === "Date" ? ${snippets.RdfVocabularies}.xsd.date : ${snippets.RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (filter.minExclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${snippets.literalFactory}.date(filter.minExclusive, schema.kind === "Date" ? ${snippets.RdfVocabularies}.xsd.date : ${snippets.RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }

      if (filter.minInclusive !== undefined) {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${snippets.literalFactory}.date(filter.minInclusive, schema.kind === "Date" ? ${snippets.RdfVocabularies}.xsd.date : ${snippets.RdfVocabularies}.xsd.dateTime)],
          },
          lift: true,
          type: "filter"
        });
      }
    }

    return ${snippets.termSchemaSparqlPatterns}({ ...otherParameters, filterPatterns, schema, valueVariable });
  }`,
);
