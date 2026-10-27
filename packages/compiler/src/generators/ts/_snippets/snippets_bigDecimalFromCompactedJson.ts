import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromCompactedJson`,
    code`\
const ${syntheticNamePrefix}bigDecimalFromCompactedJson: ${snippets.FromCompactedJsonFunction}<string, ${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> = 
  (compactedJson) => ${imports.Either}.encase(() => new ${imports.BigDecimal}(compactedJson));`,
  );
