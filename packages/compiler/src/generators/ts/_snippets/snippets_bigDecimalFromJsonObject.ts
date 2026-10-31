import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromJsonObject`,
    code`\
const ${syntheticNamePrefix}bigDecimalFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
  (jsonObject) => ${snippets.literalFromJsonObject}(jsonObject).chain(${imports.LiteralDecoder}.decodeBigDecimalLiteral);`,
  );
