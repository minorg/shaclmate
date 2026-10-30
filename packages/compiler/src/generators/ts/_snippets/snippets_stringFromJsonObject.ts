import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringFromJsonObject`,
    code`\
function ${syntheticNamePrefix}stringFromJsonObject<StringT extends string>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.LiteralJsonObject}, StringT, ${snippets.StringSchema}<StringT>>>[1]): ${imports.Either}<Error, StringT> {
  const { schema } = options;
  return ${snippets.literalFromJsonObject}(jsonObject)
    .chain(${imports.LiteralDecoder}.decodeStringLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
