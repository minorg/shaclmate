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
const ${syntheticNamePrefix}filterLiteral: ${snippets.FilterFunction}<${snippets.LiteralFilter}, ${imports.Literal}> = ${snippets.filterTerm};`,
  );
