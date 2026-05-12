import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_liftSparqlPatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}liftSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}liftSparqlPatterns(patterns: Iterable<${this.snippets.SparqlPattern}>): [readonly ${this.snippets.SparqlPattern}[], readonly ${this.snippets.SparqlFilterPattern}[]] {
  const liftedPatterns: ${this.snippets.SparqlFilterPattern}[] = [];
  const unliftedPatterns: ${this.snippets.SparqlPattern}[] = [];
  for (const pattern of patterns) {
    if (pattern.type === "filter" && pattern.lift) {
      liftedPatterns.push(pattern);
    } else {
      unliftedPatterns.push(pattern); 
    }
  }
  return [unliftedPatterns, liftedPatterns];
}`,
  );
