import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_strictEquals = conditionalOutput(
  `${syntheticNamePrefix}strictEquals`,
  code`\
/**
 * Compare two values for strict equality (===), returning an ${snippets_EqualsResult} rather than a boolean.
 */
function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${snippets_EqualsResult} {
  return ${snippets_EqualsResult}.fromBooleanEqualsResult(left, right, left === right);
}`,
);
