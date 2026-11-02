import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToLoggableFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToLoggableFunction`,
    code`export type ${syntheticNamePrefix}ToLoggableFunction<T> = (value: T) => any;`,
  );
