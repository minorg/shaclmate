import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}stringFromExpandedJson<StringT extends string>(expandedJson: ${snippets.TypedLiteralExpandedJson}, options: Parameters<${snippets.FromExpandedJsonFunction}<${snippets.LiteralExpandedJson}, StringT, ${snippets.StringSchema}<StringT>>>[1]): ${imports.Either}<Error, StringT> {
  const { schema } = options;
  return ${snippets.literalFromExpandedJson}(expandedJson)
    .chain(${imports.LiteralDecoder}.decodeStringLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
