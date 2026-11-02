import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToStringRecordFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToStringRecordFunction`,
    code`export type ${syntheticNamePrefix}ToStringRecordFunction<T> = (value: T) => Record<string, string>;`,
  );
