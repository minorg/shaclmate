import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToExpandedJsonFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToExpandedJsonFunction`,
    code`export type ${syntheticNamePrefix}ToExpandedJsonFunction<T, JsonT extends object> = (value: T) => JsonT;`,
  );
