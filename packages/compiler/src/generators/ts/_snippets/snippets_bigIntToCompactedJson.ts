import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntToCompactedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntToCompactedJson`,
    code`\
const ${syntheticNamePrefix}bigIntToCompactedJson: ${snippets.ToCompactedJsonFunction}<bigint, string> =
  (bigInt) => bigInt.toString();`,
  );
