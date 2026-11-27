import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_fromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.fromJsonObject`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const fromJsonObject: ${snippets.FromJsonFunction}<${snippets.TypedLiteralJsonObject}, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
    (jsonObject, options) => ${snippets.literalFromJsonObject}(jsonObject, options).chain(${imports.LiteralDecoder}.decodeBigDecimalLiteral);
}`,
  );
