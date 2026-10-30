import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanFromJsonObject`,
    code`\
function ${syntheticNamePrefix}booleanFromJsonObject<BooleanT extends boolean>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, BooleanT, ${snippets.BooleanSchema}<BooleanT>>>[1]): ${imports.Either}<Error, BooleanT> {
  const { schema } = options;
  return ${snippets.literalFromJsonObject}(jsonObject)
    .chain(${imports.LiteralDecoder}.decodeBooleanLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
