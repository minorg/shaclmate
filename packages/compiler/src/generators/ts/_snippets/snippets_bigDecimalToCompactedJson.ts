import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalToCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalToCompactedJson`,
    code`\
const ${syntheticNamePrefix}bigDecimalToCompactedJson: ${snippets.ToCompactedJsonFunction}<${imports.BigDecimal}, string> =
  (bigDecimal) => bigDecimal.toFixed();`,
  );
