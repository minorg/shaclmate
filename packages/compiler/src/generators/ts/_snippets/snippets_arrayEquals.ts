import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_EqualsResult } from "./snippets_EqualsResult.js";

export const snippets_arrayEquals = conditionalOutput(
  `${syntheticNamePrefix}arrayEquals`,
  code`\
/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */  
function ${syntheticNamePrefix}arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | ${snippets_EqualsResult},
): ${snippets_EqualsResult} {
  if (leftArray.length !== rightArray.length) {
    return ${imports.Left}({
      left: leftArray,
      right: rightArray,
      type: "ArrayLength",
    });
  }

  for (
    let leftElementIndex = 0;
    leftElementIndex < leftArray.length;
    leftElementIndex++
  ) {
    const leftElement = leftArray[leftElementIndex];

    const rightUnequals: ${snippets_EqualsResult}.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        ${snippets_EqualsResult}.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as ${snippets_EqualsResult}.Unequal,
      );
    }

    if (rightUnequals.length === rightArray.length) {
      // All right elements were unequal to the left element
      return ${imports.Left}({
        left: {
          array: leftArray,
          element: leftElement,
          elementIndex: leftElementIndex,
        },
        right: {
          array: rightArray,
          unequals: rightUnequals,
        },
        type: "ArrayElement",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return ${snippets_EqualsResult}.Equal;
}`,
);
