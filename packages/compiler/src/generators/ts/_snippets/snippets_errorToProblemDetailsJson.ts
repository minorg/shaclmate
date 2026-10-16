import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_errorToProblemDetailsJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}errorToProblemDetailsJson`,
    code`\
/**
 * Convert a thrown error (type: unknown) to a problem details JSON object.
 */
export function errorToProblemDetailsJson(error: unknown): ${snippets.ProblemDetailsJson} {
  const problemDetailsJson: ${snippets.ProblemDetailsJson} = {};

  switch (typeof error) {
    case "bigint":
    case "boolean":
    case "number":
    case "string": {
      problemDetailsJson["detail"] = error.toString();
      break;
    }
    case "function":
    case "symbol":
    case "undefined":
      break;
    case "object": {
      if (error instanceof Error) {
        problemDetailsJson["detail"] = error.message;
        problemDetailsJson["title"] = error.constructor?.name;
      }
      break;
    }
  }
}`,
  );
