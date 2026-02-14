import { code, conditionalOutput } from "ts-poet";
import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_MaybeFilter } from "./snippets_MaybeFilter.js";

export const snippets_filterMaybe = conditionalOutput(
  `${syntheticNamePrefix}filterMaybe`,
  code`\
function ${syntheticNamePrefix}filterMaybe<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${snippets_MaybeFilter}<ItemFilterT>, value: ${imports.Maybe}<ItemT>): boolean => {
    if (filter !== null) {
      if (value.isNothing()) {
        return false;
      }

      if (!filterItem(filter, value.extract()!)) {
        return false;
      }
    } else {
      if (value.isJust()) {
        return false;
      }
    }

    return true;
  }
}`,
);
