import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_liftSparqlPatterns: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}liftSparqlPatterns`,
    code`\
function ${syntheticNamePrefix}liftSparqlPatterns(patterns: Iterable<${snippets.SparqlPattern}>): [readonly ${snippets.SparqlPattern}[], readonly ${snippets.SparqlFilterPattern}[]] {
  const liftedPatterns: ${snippets.SparqlFilterPattern}[] = [];
  const unliftedPatterns: ${snippets.SparqlPattern}[] = [];
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
