import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeToCompactedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeToCompactedJson`,
    code`\
const ${syntheticNamePrefix}dateTimeToCompactedJson: ${snippets.ToCompactedJsonFunction}<Date, string> =
  (date) => date.toISOString();`,
  );
