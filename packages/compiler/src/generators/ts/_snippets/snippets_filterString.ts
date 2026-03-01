import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_StringFilter } from "./snippets_StringFilter.js";

export const snippets_filterString = conditionalOutput(
  `${syntheticNamePrefix}filterString`,
  code`\
function ${syntheticNamePrefix}filterString(filter: ${snippets_StringFilter}, value: string) {
  if (filter.in !== undefined && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (filter.maxLength !== undefined && value.length > filter.maxLength) {
    return false;
  }

  if (filter.minLength !== undefined && value.length < filter.minLength) {
    return false;
  }

  return true;
}`,
);
