import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateEquals: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateEquals`,
    code`\
/**
 * Compare two Dates and return an ${snippets.EqualsResult}.
 */
function ${syntheticNamePrefix}dateEquals(left: Date, right: Date): ${snippets.EqualsResult} {
  return ${snippets.EqualsResult}.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`,
  );
