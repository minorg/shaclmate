import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToJsonFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToJsonFunction`,
    code`\
type ${syntheticNamePrefix}ToJsonFunction<T extends object> = { (this: T): object; (this_: T): object; };`,
  );
