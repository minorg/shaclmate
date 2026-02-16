import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralSchema = conditionalOutput(
  `${syntheticNamePrefix}LiteralSchema`,
  code`\
interface ${syntheticNamePrefix}LiteralSchema {
  readonly kind: "LiteralType";
  readonly in?: readonly ${imports.Literal}[];
  readonly languageIn?: readonly string[];
}`,
);
