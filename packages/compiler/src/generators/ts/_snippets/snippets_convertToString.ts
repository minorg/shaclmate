import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToString`,
    code`\
function ${syntheticNamePrefix}convertToString<ValueT extends string>(_schema: ${snippets.StringSchema}, value: ValueT): ${imports.Either}<Error, ValueT> {
  return ${imports.Either}.of(value);
}`,
  );
