import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateToCompactedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateToCompactedJson`,
    code`\
const ${syntheticNamePrefix}dateToCompactedJson: ${snippets.ToCompactedJsonFunction}<Date, string> =
  (date) => ${snippets.toIsoDateString}(date);`,
  );
