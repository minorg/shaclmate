import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_strictEquals: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}strictEquals`,
    code`\
/**
 * Compare two values for strict equality (===), returning an ${this.snippets.EqualsResult} rather than a boolean.
 */
function ${syntheticNamePrefix}strictEquals<T extends bigint | boolean | number | string>(
  left: T,
  right: T,
): ${this.snippets.EqualsResult} {
  return ${this.snippets.EqualsResult}.fromBooleanEqualsResult(left, right, left === right);
}`,
  );
