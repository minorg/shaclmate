import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeToJsonString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeToJsonString`,
    code`\
const ${syntheticNamePrefix}dateTimeToJsonString: ${snippets.ToJsonFunction}<Date, string> =
  (date) => date.toISOString();`,
  );
