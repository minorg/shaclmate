import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_intFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}intFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}intFromExpandedJson<IntT extends number>(expandedJson: ${snippets.TypedLiteralExpandedJson}, options: Parameters<${snippets.FromExpandedJsonFunction}<${snippets.TypedLiteralExpandedJson}, IntT, ${snippets.NumericSchema}<IntT>>>[1]): ${imports.Either}<Error, IntT> {
  const { schema } = options;
  return ${snippets.literalFromExpandedJson}(expandedJson)
    .chain(${imports.LiteralDecoder}.decodeIntLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
