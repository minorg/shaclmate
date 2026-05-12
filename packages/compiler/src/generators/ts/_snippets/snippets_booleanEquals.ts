import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanEquals: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanEquals`,
    code`\
/**
 * Compare two objects with equals(other: T): boolean methods and return an ${this.snippets.EqualsResult}.
 */
function ${syntheticNamePrefix}booleanEquals<T extends { equals: (other: T) => boolean }>(
  left: T,
  right: T,
): ${this.snippets.EqualsResult} {
  return ${this.snippets.EqualsResult}.fromBooleanEqualsResult(
    left,
    right,
    left.equals(right),
  );
}`,
  );
