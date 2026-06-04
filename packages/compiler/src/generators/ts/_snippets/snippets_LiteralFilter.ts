import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralFilter: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LiteralFilter`,
    code`\
type ${syntheticNamePrefix}LiteralFilter = Omit<${snippets.TermFilter}<${imports.Literal}>, "typeIn">;`,
  );
