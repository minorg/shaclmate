import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_CollectionFilter: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}CollectionFilter`,
    code`\
type ${syntheticNamePrefix}CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly ${syntheticNamePrefix}maxCount?: number;
  readonly ${syntheticNamePrefix}minCount?: number;
};`,
  );
