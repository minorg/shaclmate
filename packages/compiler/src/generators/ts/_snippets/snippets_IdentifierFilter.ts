import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierFilter = conditionalOutput(
  `${syntheticNamePrefix}IdentifierFilter`,
  code`\
interface ${syntheticNamePrefix}IdentifierFilter {
  readonly in?: readonly (${imports.BlankNode} | ${imports.NamedNode})[];
  readonly type?: "BlankNode" | "NamedNode";
}`,
);
