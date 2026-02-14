import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_DateFilter } from "./snippets_DateFilter.js";

export const snippets_filterDate = conditionalOutput(
  `${syntheticNamePrefix}filterDate`,
  code`\
function ${syntheticNamePrefix}filterDate(filter: ${snippets_DateFilter}, value: Date) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.getTime() === value.getTime())) {
    return false;
  }

  if (typeof filter.maxExclusive !== "undefined" && value.getTime() >= filter.maxExclusive.getTime()) {
    return false;
  }

  if (typeof filter.maxInclusive !== "undefined" && value.getTime() > filter.maxInclusive.getTime()) {
    return false;
  }

  if (typeof filter.minExclusive !== "undefined" && value.getTime() <= filter.minExclusive.getTime()) {
    return false;
  }

  if (typeof filter.minInclusive !== "undefined" && value.getTime() < filter.minInclusive.getTime()) {
    return false;
  }

  return true;
}`,
);
