import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_deduplicateSparqlPatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}deduplicateSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}deduplicateSparqlPatterns(patterns: readonly ${this.snippets.SparqlPattern}[]): readonly ${this.snippets.SparqlPattern}[] {
  if (patterns.length === 0) {
    return patterns;
  }

  const deduplicatedPatterns: ${this.snippets.SparqlPattern}[] = [];
  const deduplicatePatternStrings = new Set<string>();
  for (const pattern of patterns) {
    const patternString = JSON.stringify(pattern);
    if (!deduplicatePatternStrings.has(patternString)) {
      deduplicatePatternStrings.add(patternString);
      deduplicatedPatterns.push(pattern);
    }
  }
  return deduplicatedPatterns;
}`,
  );
