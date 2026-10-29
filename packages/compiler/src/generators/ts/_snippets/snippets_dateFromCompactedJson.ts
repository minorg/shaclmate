import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromCompactedJson`,
    code`\
const ${syntheticNamePrefix}dateFromCompactedJson: ${snippets.FromCompactedJsonFunction}<string, Date, ${snippets.DateSchema}> = 
  (compactedJson) => ${imports.Either}.encase(() => new Date(compactedJson));`,
  );
