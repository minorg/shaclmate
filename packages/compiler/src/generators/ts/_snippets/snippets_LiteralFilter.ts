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
interface ${syntheticNamePrefix}LiteralFilter extends Omit<${snippets.TermFilter}, "in" | "type"> {
  readonly in?: readonly ${imports.Literal}[];
}`,
  );
