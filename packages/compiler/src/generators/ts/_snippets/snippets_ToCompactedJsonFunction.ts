import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToCompactedJsonFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToCompactedJsonFunction`,
    code`export type ${syntheticNamePrefix}ToCompactedJsonFunction<T, CompactedJsonT> = (value: T) => CompactedJsonT;`,
  );
