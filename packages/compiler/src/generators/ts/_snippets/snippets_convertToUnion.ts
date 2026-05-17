import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToUnion: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToUnion`,
    code`\
function ${syntheticNamePrefix}convertToUnion<ValueT>(_schema: unknown, value: ValueT): ${imports.Either}<Error, ValueT> {
  return ${imports.Either}.of(value);
}`,
  );
