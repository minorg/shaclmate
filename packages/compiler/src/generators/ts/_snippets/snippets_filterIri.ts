import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_IriFilter } from "./snippets_IriFilter.js";

export const snippets_filterIri = conditionalOutput(
  `${syntheticNamePrefix}filterIri`,
  code`\
function ${syntheticNamePrefix}filterIri(filter: ${snippets_IriFilter}, value: ${imports.NamedNode}) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
);
