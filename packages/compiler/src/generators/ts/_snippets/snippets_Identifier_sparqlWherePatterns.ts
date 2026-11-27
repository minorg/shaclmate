import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_sparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.sparqlWherePatterns`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const sparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.Identifier_Filter}, ${snippets.Identifier_Schema}> =
    ({ filter, propertyPatterns, valueVariable }) => {
      const patterns: ${snippets.SparqlPattern}[] = propertyPatterns.concat();

      if (filter) {
        if (filter.in !== undefined) {
          const valueIn = filter.in.filter(identifier => identifier.termType === "NamedNode");
          if (valueIn.length > 0) {
            patterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn }));
          }
        }

        if (filter.type !== undefined) {
          patterns.push({
            expression: {
              type: "operation",
              operator: filter.type === "BlankNode" ? "isBlank" : "isIRI",
              args: [valueVariable],
            },
            lift: true,
            type: "filter",
          });
        }
      }

      return patterns;
    }
}`,
  );
