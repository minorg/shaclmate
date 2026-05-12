import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeEquals: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeEquals`,
    code`\
function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: ${imports.Maybe}<T>,
  rightMaybe: ${imports.Maybe}<T>,
  valueEquals: (left: T, right: T) => boolean | ${snippets.EqualsResult},
): ${snippets.EqualsResult} {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${snippets.EqualsResult}.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return ${imports.Left}({
      left: leftMaybe.unsafeCoerce(),
      type: "right-null",
    });
  }

  if (rightMaybe.isJust()) {
    return ${imports.Left}({
      right: rightMaybe.unsafeCoerce(),
      type: "left-null",
    });
  }

  return ${snippets.EqualsResult}.Equal;
}`,
  );
