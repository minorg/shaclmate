import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_liftSparqlPatterns = conditionalOutput(
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
