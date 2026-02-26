import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_NumericFilter } from "./snippets_NumericFilter.js";

export const snippets_filterNumeric = conditionalOutput(
  `${syntheticNamePrefix}filterNumeric`,
  code`\
function ${syntheticNamePrefix}filterNumeric<T extends bigint | number>(filter: ${snippets_NumericFilter}<T>, value: T) {
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
