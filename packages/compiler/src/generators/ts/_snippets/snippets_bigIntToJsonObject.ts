import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntToJsonObject`,
    code`\
function ${syntheticNamePrefix}bigIntToJsonObject(datatype: ${imports.NamedNode}): ${snippets.ToJsonObjectFunction}<bigint, ${snippets.TypedLiteralJsonObject}> {
  return (value) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.bigint(value, datatype));
}`,
  );
