import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_deduplicateSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}deduplicateSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}deduplicateSparqlPatterns(patterns: readonly ${snippets_SparqlPattern}[]): readonly ${snippets_SparqlPattern}[] {
  if (patterns.length === 0) {
    return patterns;
  }

  const deduplicatedPatterns: ${snippets_SparqlPattern}[] = [];
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
