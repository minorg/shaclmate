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
  leftMaybe: ${this.imports.Maybe}<T>,
  rightMaybe: ${this.imports.Maybe}<T>,
  valueEquals: (left: T, right: T) => boolean | ${this.snippets.EqualsResult},
): ${this.snippets.EqualsResult} {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${this.snippets.EqualsResult}.fromBooleanEqualsResult(
        leftMaybe,
        rightMaybe,
        valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
      );
    }
    return ${this.imports.Left}({
      left: leftMaybe.unsafeCoerce(),
      type: "right-null",
    });
  }

  if (rightMaybe.isJust()) {
    return ${this.imports.Left}({
      right: rightMaybe.unsafeCoerce(),
      type: "left-null",
    });
  }

  return ${this.snippets.EqualsResult}.Equal;
}`,
  );
