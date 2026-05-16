import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToNumeric: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToNumeric`,
    code`\
function ${syntheticNamePrefix}convertToNumeric<T extends bigint | number>(schema: ${snippets.NumericSchema}<T>, value: T): T {
  return value;
}`,
  );
