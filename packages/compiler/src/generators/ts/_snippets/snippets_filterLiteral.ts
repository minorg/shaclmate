import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterLiteral: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterLiteral`,
    code`\
function ${syntheticNamePrefix}filterLiteral(filter: ${snippets.LiteralFilter}, value: ${imports.Literal}): boolean {
  return ${snippets.filterTerm}(filter, value);
}`,
  );
