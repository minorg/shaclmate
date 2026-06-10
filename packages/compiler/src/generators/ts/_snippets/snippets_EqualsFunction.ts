import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_EqualsFunction: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}EqualsFunction`,
    code`\
export type ${syntheticNamePrefix}EqualsFunction<T> = (left: T, right: T) => ${snippets.EqualsResult};`,
  );
