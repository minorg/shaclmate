import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_sortSparqlPatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}sortSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}sortSparqlPatterns(patterns: readonly ${this.snippets.SparqlPattern}[]): readonly ${this.snippets.SparqlPattern}[] {
  const filterPatterns: ${this.snippets.SparqlPattern}[] = [];
  const otherPatterns: ${this.snippets.SparqlPattern}[] = [];
  const valuesPatterns: ${this.snippets.SparqlPattern}[] = [];

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
