import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";

export const snippets_SparqlPattern_isSolutionGenerating = conditionalOutput(
  `${syntheticNamePrefix}SparqlPattern_isSolutionGenerating`,
  code`\
namespace ${syntheticNamePrefix}SparqlPattern {
  export function isSolutionGenerating(pattern: ${snippets_SparqlPattern}): boolean {
    switch (pattern.type) {
      case "bind":
      case "bgp":        
      case "service":
      case "values":
        return true;
      
      case "graph":
      case "group":
        return pattern.patterns.some(isSolutionGenerating);

      case "filter":
      case "minus":
      case "optional":
        return false;

      case "union":
        // A union pattern is solution-generating if every branch is solution-generating
        return pattern.patterns.every(isSolutionGenerating);

      default:
        throw new RangeError(\`unable to determine whether "\${pattern.type}" pattern is solution-generating\`);
    }
  }
}`,
);
