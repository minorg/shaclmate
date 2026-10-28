import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}bigIntFromExpandedJson<BigIntT extends bigint>(expandedJson: ${snippets.LiteralExpandedJson}, options: Parameters<${snippets.FromExpandedJsonFunction}<BigIntT, ${snippets.NumericSchema}<BigIntT>>>[1]): ${imports.Either}<Error, BigIntT> {
  const { schema } = options;
  return ${snippets.literalFromExpandedJson}(expandedJson)
    .chain(${imports.LiteralDecoder}.decodeBigIntLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
