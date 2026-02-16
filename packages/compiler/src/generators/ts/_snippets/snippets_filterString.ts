import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_StringFilter } from "./snippets_StringFilter.js";

export const snippets_filterString = conditionalOutput(
  `${syntheticNamePrefix}filterString`,
  code`\
function ${syntheticNamePrefix}filterString(filter: ${snippets_StringFilter}, value: string) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxLength !== "undefined" && value.length > filter.maxLength) {
    return false;
  }

  if (typeof filter.minLength !== "undefined" && value.length < filter.minLength) {
    return false;
  }

  return true;
}`,
);
