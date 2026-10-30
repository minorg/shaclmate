import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToJsonValueFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToJsonValueFunction`,
    code`export type ${syntheticNamePrefix}ToJsonValueFunction<T, JsonValueT> = (value: T) => JsonValueT;`,
  );
