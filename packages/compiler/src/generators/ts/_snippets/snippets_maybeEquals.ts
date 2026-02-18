import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_maybeEquals = conditionalOutput(
  `${syntheticNamePrefix}maybeEquals`,
  code`\
function ${syntheticNamePrefix}maybeEquals<T>(
  leftMaybe: ${imports.Maybe}<T>,
  rightMaybe: ${imports.Maybe}<T>,
  valueEquals: (left: T, right: T) => boolean | ${snippets_EqualsResult},
): ${snippets_EqualsResult} {
  if (leftMaybe.isJust()) {
    if (rightMaybe.isJust()) {
      return ${snippets_EqualsResult}.fromBooleanEqualsResult(
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

  return ${snippets_EqualsResult}.Equal;
}`,
);
