import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalToExpandedJson`,
    code`\
const ${syntheticNamePrefix}bigDecimalToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.BigDecimal}, ${snippets.LiteralExpandedJson}> =
  (value, { schema }) => ${snippets.literalToExpandedJson}(${snippets.literalFactory}.bigdecimal(value, schema.datatype));`,
  );
