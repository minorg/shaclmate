import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_strictEquals = conditionalOutput(
  `${syntheticNamePrefix}strictEquals`,
  code`\
/**
 * Compare two values for strict equality (===), returning an ${snippets.EqualsResult} rather than a boolean.
 */
function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${snippets.EqualsResult} {
  return ${snippets.EqualsResult}.fromBooleanEqualsResult(left, right, left === right);
}`,
);
