import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_FilterFunction: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}FilterFunction`,
    code`export type ${syntheticNamePrefix}FilterFunction<FilterT, ValueT> = (filter: FilterT, value: ValueT) => boolean`,
  );
