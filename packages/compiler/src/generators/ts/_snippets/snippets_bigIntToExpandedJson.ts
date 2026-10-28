import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntToExpandedJson`,
    code`\
function ${syntheticNamePrefix}bigIntToExpandedJson(datatype: ${imports.NamedNode}): ${snippets.ToExpandedJsonFunction}<bigint, ${snippets.LiteralExpandedJson}> {
  return (value) => ${snippets.literalToExpandedJson}(${snippets.literalFactory}.bigint(value, datatype));
}`,
  );
