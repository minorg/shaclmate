import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_filterTerm } from "./snippets_filterTerm.js";
import { snippets_LiteralFilter } from "./snippets_LiteralFilter.js";

export const snippets_filterLiteral = conditionalOutput(
  `${syntheticNamePrefix}filterLiteral`,
  code`\
function ${syntheticNamePrefix}filterLiteral(filter: ${snippets_LiteralFilter}, value: ${imports.Literal}): boolean {
  return ${snippets_filterTerm}(filter, value);
}`,
);
