import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
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
