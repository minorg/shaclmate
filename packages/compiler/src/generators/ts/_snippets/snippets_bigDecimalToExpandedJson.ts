import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalToExpandedJson`,
    code`\
function ${syntheticNamePrefix}bigDecimalToExpandedJson(datatype: ${imports.NamedNode}): ${snippets.ToExpandedJsonFunction}<${imports.BigDecimal}, ${snippets.TypedLiteralExpandedJson}> {
  return (value) => ${snippets.typedLiteralToExpandedJson}(${snippets.literalFactory}.bigdecimal(value, datatype));
}`,
  );
