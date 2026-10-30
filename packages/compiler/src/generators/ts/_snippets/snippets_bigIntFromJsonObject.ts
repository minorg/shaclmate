import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromJsonObject`,
    code`\
function ${syntheticNamePrefix}bigIntFromJsonObject<BigIntT extends bigint>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
  const { schema } = options;
  return ${snippets.literalFromJsonObject}(jsonObject)
    .chain(${imports.LiteralDecoder}.decodeBigIntLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
