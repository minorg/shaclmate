import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayEquals: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayEquals`,
    code`\
/**
 * Compare two arrays element-wise with the provided elementEquals function.
 */  
function ${syntheticNamePrefix}arrayEquals<T>(
  leftArray: readonly T[],
  rightArray: readonly T[],
  elementEquals: (left: T, right: T) => boolean | ${snippets.EqualsResult},
): ${snippets.EqualsResult} {
  if (leftArray.length !== rightArray.length) {
    return ${imports.Left}({
      left: leftArray,
      right: rightArray,
      type: "array-length",
    });
  }

  for (
    let leftElementIndex = 0;
    leftElementIndex < leftArray.length;
    leftElementIndex++
  ) {
    const leftElement = leftArray[leftElementIndex];

    const rightUnequals: ${snippets.EqualsResult}.Unequal[] = [];
    for (
      let rightElementIndex = 0;
      rightElementIndex < rightArray.length;
      rightElementIndex++
    ) {
      const rightElement = rightArray[rightElementIndex];

      const leftElementEqualsRightElement =
        ${snippets.EqualsResult}.fromBooleanEqualsResult(
          leftElement,
          rightElement,
          elementEquals(leftElement, rightElement),
        );
      if (leftElementEqualsRightElement.isRight()) {
        break; // left element === right element, break out of the right iteration
      }
      rightUnequals.push(
        leftElementEqualsRightElement.extract() as ${snippets.EqualsResult}.Unequal,
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
        type: "array-element",
      });
    }
    // Else there was a right element equal to the left element, continue to the next left element
  }

  return ${snippets.EqualsResult}.Equal;
}`,
  );
