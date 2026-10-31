import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalToJsonObject`,
    code`\
function ${syntheticNamePrefix}bigDecimalToJsonObject(datatype: ${imports.NamedNode}): ${snippets.ToJsonObjectFunction}<${imports.BigDecimal}, ${snippets.TypedLiteralJsonObject}> {
  return (value) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.bigdecimal(value, datatype));
}`,
  );
