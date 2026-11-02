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
export function ${syntheticNamePrefix}errorToProblemDetailsJson(error: unknown): ${snippets.ProblemDetailsJson} {
  switch (typeof error) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
      return { detail: error.toString(), status: 500 };
    case "function":
    case "symbol":
    case "undefined":
        break;
    case "object": {
      if (error instanceof Error) {
        return { detail: error.message, status: 500, title: error.constructor?.name };
      }
      break;
    }
  }

  return { status: 500 };
}`,
  );
