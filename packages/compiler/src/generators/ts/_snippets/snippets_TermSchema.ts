import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermSchema = conditionalOutput(
  `${syntheticNamePrefix}TermSchema`,
  code`\
interface ${syntheticNamePrefix}TermSchema {
  readonly in?: readonly (${imports.Literal} | ${imports.NamedNode})[];
  readonly kind: "Term";
}`,
);
