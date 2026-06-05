import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LiteralSchema`,
    code`\
interface ${syntheticNamePrefix}LiteralSchema {
  readonly hasValues?: readonly ${imports.Literal}[];
  readonly in?: readonly ${imports.Literal}[];
  readonly kind: "Literal";
  readonly languageIn?: readonly string[];
}`,
  );
