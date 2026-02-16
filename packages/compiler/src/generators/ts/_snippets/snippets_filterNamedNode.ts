import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_NamedNodeFilter } from "./snippets_NamedNodeFilter.js";

export const snippets_filterNamedNode = conditionalOutput(
  `${syntheticNamePrefix}filterNamedNode`,
  code`\
function ${syntheticNamePrefix}filterNamedNode(filter: ${snippets_NamedNodeFilter}, value: ${imports.NamedNode}) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  return true;
}`,
);
