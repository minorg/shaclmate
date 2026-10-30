import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_intFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}intFromJsonObject`,
    code`\
function ${syntheticNamePrefix}intFromJsonObject<IntT extends number>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, IntT, ${snippets.NumericSchema}<IntT>>>[1]): ${imports.Either}<Error, IntT> {
  const { schema } = options;
  return ${snippets.literalFromJsonObject}(jsonObject)
    .chain(${imports.LiteralDecoder}.decodeIntLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
