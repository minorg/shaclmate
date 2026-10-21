import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FromJsonFunction: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FromJsonFunction`,
    code`export type ${syntheticNamePrefix}FromJsonFunction<T, JsonT> = (value: JsonT) => ${imports.Either}<Error, T>;`,
  );
