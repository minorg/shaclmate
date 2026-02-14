import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_NumberFilter } from "./snippets_NumberFilter.js";

export const snippets_filterNumber = conditionalOutput(
  `${syntheticNamePrefix}filterNumber`,
  code`\
function ${syntheticNamePrefix}filterNumber(filter: ${snippets_NumberFilter}, value: number) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxExclusive !== "undefined" && value >= filter.maxExclusive) {
    return false;
  }

  if (typeof filter.maxInclusive !== "undefined" && value > filter.maxInclusive) {
    return false;
  }

  if (typeof filter.minExclusive !== "undefined" && value <= filter.minExclusive) {
    return false;
  }

  if (typeof filter.minInclusive !== "undefined" && value < filter.minInclusive) {
    return false;
  }

  return true;
}`,
);
