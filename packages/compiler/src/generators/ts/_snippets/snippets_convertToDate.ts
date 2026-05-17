import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToDate: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToDate`,
    code`\
function ${syntheticNamePrefix}convertToDate(_schema: ${snippets.DateSchema}, value: Date): ${imports.Either}<Error, Date> {
  return ${imports.Either}.of(value);
}`,
  );
