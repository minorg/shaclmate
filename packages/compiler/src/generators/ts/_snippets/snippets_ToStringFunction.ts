import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_ToStringFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}ToStringFunction`,
    code`\
type ${syntheticNamePrefix}ToStringFunction<T extends object> = { (this: T): string; (this_: T): string; };`,
  );
