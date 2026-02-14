import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_BooleanFilter } from "./snippets_BooleanFilter.js";

export const snippets_filterBoolean = conditionalOutput(
  `${syntheticNamePrefix}filterBoolean`,
  code`\
function ${syntheticNamePrefix}filterBoolean(filter: ${snippets_BooleanFilter}, value: boolean) {
  if (typeof filter.value !== "undefined" && value !== filter.value) {
    return false;
  }

  return true;
}`,
);
