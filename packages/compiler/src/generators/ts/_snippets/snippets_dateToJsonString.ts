import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateToJsonString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateToJsonString`,
    code`\
const ${syntheticNamePrefix}dateToJsonString: ${snippets.ToJsonFunction}<Date, string> =
  (date) => ${snippets.toIsoDateString}(date);`,
  );
