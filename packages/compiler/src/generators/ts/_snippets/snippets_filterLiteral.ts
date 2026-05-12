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
function ${syntheticNamePrefix}filterLiteral(filter: ${this.snippets.LiteralFilter}, value: ${this.imports.Literal}): boolean {
  return ${this.snippets.filterTerm}(filter, value);
}`,
  );
