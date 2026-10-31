import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_floatFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}floatFromJsonObject`,
    code`\
function ${syntheticNamePrefix}floatFromJsonObject<FloatT extends number>(jsonObject: ${snippets.TypedLiteralJsonObject}, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, FloatT, ${snippets.NumericSchema}<FloatT>>>[1]): ${imports.Either}<Error, FloatT> {
  const { schema } = options;
  return ${snippets.literalFromJsonObject}(jsonObject)
    .chain(${imports.LiteralDecoder}.decodeFloatLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
