import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_arrayIntersection = conditionalOutput(
  `${syntheticNamePrefix}arrayIntersection`,
  code`\
function ${syntheticNamePrefix}arrayIntersection<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  if (left.length === 0) {
    return right;
  }
  if (right.length === 0) {
    return left;
  }

  const intersection = new Set<T>();
  if (left.length <= right.length) {
    const rightSet = new Set(right);
    for (const leftElement of left) {
      if (rightSet.has(leftElement)) {
        intersection.add(leftElement);
      }
    }
  } else {
    const leftSet = new Set(left);
    for (const rightElement of right) {
      if (leftSet.has(rightElement)) {
        intersection.add(rightElement);
      }  
    }
  }
  return [...intersection];
}`,
);
