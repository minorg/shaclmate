import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_CollectionFilter = conditionalOutput(
  `${syntheticNamePrefix}CollectionFilter`,
  code`\
type ${syntheticNamePrefix}CollectionFilter<ItemFilterT> = ItemFilterT & {
  readonly ${syntheticNamePrefix}maxCount?: number;
  readonly ${syntheticNamePrefix}minCount?: number;
};`,
);
