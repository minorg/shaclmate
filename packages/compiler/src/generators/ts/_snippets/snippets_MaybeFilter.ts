import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_MaybeFilter = conditionalOutput(
  `${syntheticNamePrefix}MaybeFilter`,
  code`\
type ${syntheticNamePrefix}MaybeFilter<ItemFilterT> = ItemFilterT | null;`,
);
