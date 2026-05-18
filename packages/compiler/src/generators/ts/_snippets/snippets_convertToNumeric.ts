import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToNumeric: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToNumeric`,
    code`\
function ${syntheticNamePrefix}convertToNumeric<ValueT extends bigint | number>(_schema: ${snippets.NumericSchema}<ValueT>, value: ValueT): ${imports.Either}<Error, ValueT> {
  return ${imports.Either}.of(value);
}`,
  );
