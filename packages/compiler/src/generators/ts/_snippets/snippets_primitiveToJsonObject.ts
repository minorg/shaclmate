import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveToJsonObject`,
    code`\
function ${syntheticNamePrefix}primitiveToJsonObject<PrimitiveT extends boolean | number | string>(datatype: ${imports.NamedNode}): ${snippets.ToJsonObjectFunction}<PrimitiveT, ${snippets.TypedLiteralJsonObject}> {
  return (primitive) => ${snippets.typedLiteralToJsonObject}(${snippets.literalFactory}.primitive(primitive, datatype));
}`,
  );
