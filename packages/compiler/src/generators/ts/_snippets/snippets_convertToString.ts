import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToString`,
    code`\
function ${syntheticNamePrefix}convertToString<ValueT extends string>(schema: ${snippets.StringSchema}, value: ValueT) {
  return value;
}`,
  );
