import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterDate: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterDate`,
    code`\
function ${syntheticNamePrefix}filterDate(filter: ${snippets.DateFilter}, value: Date) {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue.getTime() === value.getTime())) {
    return false;
  }

  if (filter.maxExclusive !== undefined && value.getTime() >= filter.maxExclusive.getTime()) {
    return false;
  }

  if (filter.maxInclusive !== undefined && value.getTime() > filter.maxInclusive.getTime()) {
    return false;
  }

  if (filter.minExclusive !== undefined && value.getTime() <= filter.minExclusive.getTime()) {
    return false;
  }

  if (filter.minInclusive !== undefined && value.getTime() < filter.minInclusive.getTime()) {
    return false;
  }

  return true;
}`,
  );
