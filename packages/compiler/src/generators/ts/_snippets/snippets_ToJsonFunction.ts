import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToJsonFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToJsonFunction`,
    code`export type ${syntheticNamePrefix}ToJsonFunction<T, JsonT> = (value: T) => JsonT;`,
  );
