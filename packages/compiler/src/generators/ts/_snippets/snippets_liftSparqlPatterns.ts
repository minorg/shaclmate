import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlFilterPattern } from "./snippets_SparqlFilterPattern.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_liftSparqlPatterns = conditionalOutput(
  `${syntheticNamePrefix}liftSparqlPatterns`,
  code`\
function ${syntheticNamePrefix}liftSparqlPatterns(patterns: Iterable<${snippets_SparqlPattern}>): [readonly ${snippets_SparqlPattern}[], readonly ${snippets_SparqlFilterPattern}[]] {
  const liftedPatterns: ${snippets_SparqlFilterPattern}[] = [];
  const unliftedPatterns: ${snippets_SparqlPattern}[] = [];
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
