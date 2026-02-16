import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_TermFilter } from "./snippets_TermFilter.js";

export const snippets_LiteralFilter = conditionalOutput(
  `${syntheticNamePrefix}LiteralFilter`,
  code`\
interface ${syntheticNamePrefix}LiteralFilter extends Omit<${snippets_TermFilter}, "in" | "type"> {
  readonly in?: readonly ${imports.Literal}[];
}`,
);
