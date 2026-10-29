import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_primitiveToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}primitiveToExpandedJson`,
    code`\
function ${syntheticNamePrefix}primitiveToExpandedJson<PrimitiveT extends boolean | number | string>(datatype: ${imports.NamedNode}): ${snippets.ToExpandedJsonFunction}<PrimitiveT, ${snippets.TypedLiteralExpandedJson}> {
  return (primitive) => ${snippets.typedLiteralToExpandedJson}(${snippets.literalFactory}.primitive(primitive, datatype));
}`,
  );
