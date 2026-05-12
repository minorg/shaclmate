import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sortSparqlPatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}sortSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}sortSparqlPatterns(patterns: readonly ${snippets.SparqlPattern}[]): readonly ${snippets.SparqlPattern}[] {
  const filterPatterns: ${snippets.SparqlPattern}[] = [];
  const otherPatterns: ${snippets.SparqlPattern}[] = [];
  const valuesPatterns: ${snippets.SparqlPattern}[] = [];

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
