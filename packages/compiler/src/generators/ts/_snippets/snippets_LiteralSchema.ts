import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralSchema = conditionalOutput(
  `${syntheticNamePrefix}LiteralSchema`,
  code`\
interface ${syntheticNamePrefix}LiteralSchema {
  readonly in?: readonly ${imports.Literal}[];
  readonly kind: "Literal";
  readonly languageIn?: readonly string[];
}`,
);
