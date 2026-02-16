import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_IdentifierFilter } from "./snippets_IdentifierFilter.js";
import { snippets_IdentifierSchema } from "./snippets_IdentifierSchema.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";
import { snippets_sparqlValueInPattern } from "./snippets_sparqlValueInPattern.js";

export const snippets_identifierSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}identifierSparqlWherePatterns`,
  code`\
const ${syntheticNamePrefix}identifierSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<${snippets_IdentifierFilter}, ${snippets_IdentifierSchema}> =
  ({ filter, propertyPatterns, valueVariable }) => {
    const patterns: ${snippets_SparqlPattern}[] = propertyPatterns.concat();

    if (filter) {
      if (typeof filter.in !== "undefined") {
        const valueIn = filter.in.filter(identifier => identifier.termType === "NamedNode");
        if (valueIn.length > 0) {
          patterns.push(${snippets_sparqlValueInPattern}({ lift: true, valueVariable, valueIn }));
        }
      }

      if (typeof filter.type !== "undefined") {
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
