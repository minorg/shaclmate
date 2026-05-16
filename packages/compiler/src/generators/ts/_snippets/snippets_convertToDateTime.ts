import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToDateTime: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToDateTime`,
    code`\
function ${syntheticNamePrefix}convertToDateTime(schema: ${snippets.DateSchema}, value: Date): Date {
  return value;
}`,
  );
