import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}booleanFromExpandedJson<BooleanT extends boolean>(expandedJson: ${snippets.LiteralExpandedJson}, options: Parameters<${snippets.FromExpandedJsonFunction}<${snippets.LiteralExpandedJson}, BooleanT, ${snippets.BooleanSchema}<BooleanT>>>[1]): ${imports.Either}<Error, BooleanT> {
  const { schema } = options;
  return ${snippets.literalFromExpandedJson}(expandedJson)
    .chain(${imports.LiteralDecoder}.decodeBooleanLiteral)
    .chain(value => ${snippets.constrainPrimitive}(value, schema.in));
}`,
  );
