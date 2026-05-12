import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_IdentifierFilter } from "./snippets_IdentifierFilter.js";
import { snippets_IdentifierSchema } from "./snippets_IdentifierSchema.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_identifierSparqlWherePatterns = conditionalOutput(
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
