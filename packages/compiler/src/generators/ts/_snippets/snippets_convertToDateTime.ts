import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToDateTime: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToDateTime`,
    code`\
function ${syntheticNamePrefix}convertToDateTime(_schema: ${snippets.DateSchema}, value: Date): ${imports.Either}<Error, Date> {
  return ${imports.Either}.of(value);
}`,
  );
