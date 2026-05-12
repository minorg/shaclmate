import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterNumeric: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterNumeric`,
    code`\
function ${syntheticNamePrefix}filterNumeric<T extends bigint | number>(filter: ${snippets.NumericFilter}<T>, value: T) {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (filter.maxExclusive !== undefined && value >= filter.maxExclusive) {
    return false;
  }

  if (filter.maxInclusive !== undefined && value > filter.maxInclusive) {
    return false;
  }

  if (filter.minExclusive !== undefined && value <= filter.minExclusive) {
    return false;
  }

  if (filter.minInclusive !== undefined && value < filter.minInclusive) {
    return false;
  }

  return true;
}`,
  );
