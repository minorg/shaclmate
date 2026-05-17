import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToNumeric: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToNumeric`,
    code`\
function ${syntheticNamePrefix}convertToNumeric<ValueT extends bigint | number>(_schema: ${snippets.NumericSchema}<ValueT>, value: ValueT): ValueT {
  return value;
}`,
  );
