import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_dateEquals = conditionalOutput(
  `${syntheticNamePrefix}dateEquals`,
  code`\
/**
 * Compare two Dates and return an ${snippets_EqualsResult}.
 */
function ${syntheticNamePrefix}dateEquals(left: Date, right: Date): ${snippets_EqualsResult} {
  return ${snippets_EqualsResult}.fromBooleanEqualsResult(
    left,
    right,
    left.getTime() === right.getTime(),
  );
}`,
);
