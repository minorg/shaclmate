import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBoolean: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBoolean`,
    code`\
function ${syntheticNamePrefix}convertToBoolean<ValueT extends boolean>(_schema: ${snippets.BooleanSchema}, value: ValueT): ${imports.Either}<Error, ValueT> {
  return ${imports.Either}.of(value);
}`,
  );
