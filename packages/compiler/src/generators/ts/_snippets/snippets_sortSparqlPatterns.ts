import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_sortSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}sortSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}sortSparqlPatterns(patterns: readonly ${snippets_SparqlPattern}[]): readonly ${snippets_SparqlPattern}[] {
  const filterPatterns: ${snippets_SparqlPattern}[] = [];
  const otherPatterns: ${snippets_SparqlPattern}[] = [];
  const valuesPatterns: ${snippets_SparqlPattern}[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case "filter":
        filterPatterns.push(pattern);
        break;
      case "values":
        valuesPatterns.push(pattern);
        break;
      default:
        otherPatterns.push(pattern);
        break;
    }
  }

  return valuesPatterns.concat(otherPatterns).concat(filterPatterns);
}`,
);
