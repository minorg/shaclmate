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
  readonly in?: readonly ${this.imports.Literal}[];
  readonly kind: "Literal";
  readonly languageIn?: readonly string[];
}`,
  );
