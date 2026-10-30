import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateToJsonObject`,
    code`\
function ${syntheticNamePrefix}dateToJsonObject(datatype: ${imports.NamedNode}): ${snippets.ToJsonObjectFunction}<${imports.BigDecimal}, ${snippets.TypedLiteralJsonObject}> {
  return (value) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.date(value, datatype));
}`,
  );
