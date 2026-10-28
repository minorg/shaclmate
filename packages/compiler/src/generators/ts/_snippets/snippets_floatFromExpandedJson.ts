import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_floatFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}floatFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}floatFromExpandedJson<FloatT extends number>(expandedJson: ${snippets.LiteralExpandedJson}, options: Parameters<${snippets.FromExpandedJsonFunction}<${snippets.LiteralExpandedJson}, FloatT, ${snippets.NumericSchema}<FloatT>>>[1]): ${imports.Either}<Error, FloatT> {
  const { schema } = options;
  return ${snippets.literalFromExpandedJson}(expandedJson)
    .chain(${imports.LiteralDecoder}.decodeFloatLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
