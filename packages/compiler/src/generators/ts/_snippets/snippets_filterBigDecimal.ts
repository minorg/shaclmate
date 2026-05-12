import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterBigDecimal: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterBigDecimal`,
    code`\
function ${syntheticNamePrefix}filterBigDecimal(filter: ${snippets.NumericFilter}<${imports.BigDecimal}>, value: ${imports.BigDecimal}) {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  if (filter.maxExclusive !== undefined && value.greaterThanOrEqualTo(filter.maxExclusive)) {
    return false;
  }

  if (filter.maxInclusive !== undefined && value.greaterThan(filter.maxInclusive)) {
    return false;
  }

  if (filter.minExclusive !== undefined && value.lessThanOrEqualTo(filter.minExclusive)) {
    return false;
  }

  if (filter.minInclusive !== undefined && value.lessThan(filter.minInclusive)) {
    return false;
  }

  return true;
}`,
  );
