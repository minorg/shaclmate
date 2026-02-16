import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermFilter = conditionalOutput(
  `${syntheticNamePrefix}TermFilter`,
  code`\
interface ${syntheticNamePrefix}TermFilter {
  readonly datatypeIn?: readonly ${imports.NamedNode}[];
  readonly in?: readonly (${imports.Literal} | ${imports.NamedNode})[];
  readonly languageIn?: readonly string[];
  readonly typeIn?: readonly ("BlankNode" | "Literal" | "NamedNode")[];
}`,
);
