import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}bigDecimalFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.LiteralExpandedJson}, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
  (expandedJson) => ${snippets.literalFromExpandedJson}(expandedJson).chain(${imports.LiteralDecoder}.decodeBigDecimalLiteral);`,
  );
