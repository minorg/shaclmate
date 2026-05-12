import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierSparqlWherePatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}identifierSparqlWherePatterns: ${snippets.ValueSparqlWherePatternsFunction}<${snippets.IdentifierFilter}, ${snippets.IdentifierSchema}> =
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
  }`,
  );
