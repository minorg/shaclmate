import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_BlankNodeFilter } from "./snippets_BlankNodeFilter.js";

export const snippets_filterBlankNode = conditionalOutput(
  `${syntheticNamePrefix}filterBlankNode`,
  code`\
function ${syntheticNamePrefix}filterBlankNode(_filter: ${snippets_BlankNodeFilter}, _value: ${imports.BlankNode}) {
  return true;
}`,
);
