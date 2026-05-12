import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_deduplicateSparqlPatterns } from "./snippets_deduplicateSparqlPatterns.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlPattern_isSolutionGenerating } from "./snippets_SparqlPattern_isSolutionGenerating.js";
import { snippets_sortSparqlPatterns } from "./snippets_sortSparqlPatterns.js";

export const snippets_normalizeSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}normalizeSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}normalizeSparqlWherePatterns(patterns: readonly ${snippets.SparqlPattern}[]): readonly ${snippets.SparqlPattern}[] {
  function normalizePatternsRecursive(patternsRecursive: readonly ${snippets.SparqlPattern}[]): readonly ${snippets.SparqlPattern}[] {
    if (patternsRecursive.length === 0) {
      return patternsRecursive;
    }

    const compactedPatterns: ${snippets.SparqlPattern}[] = [];
    for (const pattern of ${snippets.deduplicateSparqlPatterns}(patternsRecursive)) {
      switch (pattern.type) {
        case "bgp": {
          if (pattern.triples.length === 0) {
            continue;
          }
          const lastPattern = compactedPatterns.at(-1);
          if (lastPattern && lastPattern.type === "bgp") {
            // Coalesce adjacent BGP patterns without mutating lastPattern
            compactedPatterns[compactedPatterns.length - 1] = { triples: lastPattern.triples.concat(pattern.triples), type: "bgp" };
          } else {
            compactedPatterns.push(pattern);
          }
          break;
        }
        case "bind":
        case "filter":
        case "query":
        case "values":
          compactedPatterns.push(pattern);
          break;
        case "group":
          // Flatten groups outside unions
          compactedPatterns.push(...normalizePatternsRecursive(pattern.patterns));
          break;
        case "graph":
        case "minus":
        case "optional":
        case "service": {
          const patterns_ = normalizePatternsRecursive(pattern.patterns);
          if (patterns_.length > 0) {
            compactedPatterns.push({ ...pattern, patterns: patterns_.concat() });
          }
          break;
        }
        case "union": {
          const unionPatterns = ${snippets.deduplicateSparqlPatterns}(pattern.patterns.flatMap(pattern => {
            switch (pattern.type) {
              case "group":
                // Don't flatten the groups in a union
              case "graph":
              case "minus":
              case "optional":
              case "service": {
                const patterns_ = normalizePatternsRecursive(pattern.patterns);
                if (patterns_.length > 0) {
                  return [{ ...pattern, patterns: patterns_.concat() }];
                }
                return [] as ${snippets.SparqlPattern}[];
              }
              default:
                return [pattern];
            }
          }));

          switch (unionPatterns.length) {
            case 0:
              break;
            case 1:
              compactedPatterns.push(...normalizePatternsRecursive([unionPatterns[0]]));
              break;
            default:
              compactedPatterns.push({ ...pattern, patterns: unionPatterns.concat() });
              break;
          }
          break;
        }
        default:
          pattern satisfies never;
      }
    }

    return ${snippets.sortSparqlPatterns}(${snippets.deduplicateSparqlPatterns}(compactedPatterns));
  }

  const normalizedPatterns = normalizePatternsRecursive(patterns);
  if (!normalizedPatterns.some(${snippets.SparqlPattern_isSolutionGenerating})) {
    throw new Error("SPARQL WHERE patterns must have at least one solution-generating pattern");
  }

  return normalizedPatterns;
}`,
);
