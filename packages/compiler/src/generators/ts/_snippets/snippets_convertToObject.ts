import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToObject`,
    code`\
function ${syntheticNamePrefix}convertToObject<ValueT extends object>(_schema: unknown, value: ValueT): ${imports.Either}<Error, ValueT> {
  return ${imports.Either}.of(value);
}`,
  );
