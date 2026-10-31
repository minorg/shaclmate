import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToJsonObjectFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToJsonObjectFunction`,
    code`export type ${syntheticNamePrefix}ToJsonObjectFunction<T, JsonObjectT extends object> = (value: T) => JsonObjectT;`,
  );
