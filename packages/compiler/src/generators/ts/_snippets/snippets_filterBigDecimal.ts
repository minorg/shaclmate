import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_NumericFilter } from "./snippets_NumericFilter.js";

export const snippets_filterBigDecimal = conditionalOutput(
  `${syntheticNamePrefix}filterBigDecimal`,
  code`\
function ${syntheticNamePrefix}filterBigDecimal(filter: ${snippets_NumericFilter}<${imports.BigDecimal}>, value: ${imports.BigDecimal}) {
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
