import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToUnion: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToUnion`,
    code`\
function ${syntheticNamePrefix}convertToUnion<ValueT extends object>(schema: unknown, value: ValueT): ValueT {
  return value;
}`,
  );
