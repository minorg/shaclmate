import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_dateEquals = conditionalOutput(
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
