import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_IdentifierFilter } from "./snippets_IdentifierFilter.js";

export const snippets_filterIdentifier = conditionalOutput(
  `${syntheticNamePrefix}filterIdentifier`,
  code`\
function ${syntheticNamePrefix}filterIdentifier(filter: ${snippets_IdentifierFilter}, value: ${imports.BlankNode} | ${imports.NamedNode}) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue.equals(value))) {
    return false;
  }

  if (typeof filter.type !== "undefined" && value.termType !== filter.type) {
    return false;
  }

  return true;
}`,
);
