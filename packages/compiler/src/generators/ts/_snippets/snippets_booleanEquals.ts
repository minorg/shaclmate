import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_booleanEquals = conditionalOutput(
  `${syntheticNamePrefix}booleanEquals`,
  code`\
/**
 * Compare two objects with equals(other: T): boolean methods and return an ${snippets.EqualsResult}.
 */
function ${syntheticNamePrefix}booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): ${snippets.EqualsResult} {
  return ${snippets.EqualsResult}.fromBooleanEqualsResult(
    left,
    right,
    left.equals(right),
  );
}`,
);
