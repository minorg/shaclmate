import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBoolean: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBoolean`,
    code`\
function ${syntheticNamePrefix}convertToBoolean<ValueT extends boolean>(_schema: ${snippets.BooleanSchema}, value: ValueT): ValueT {
  return value;
}`,
  );
