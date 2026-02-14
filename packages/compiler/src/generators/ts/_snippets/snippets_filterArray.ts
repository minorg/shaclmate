import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";

export const snippets_filterArray = conditionalOutput(
  `${syntheticNamePrefix}filterArray`,
  code`\
function ${syntheticNamePrefix}filterArray<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${snippets_CollectionFilter}<ItemFilterT>, values: readonly ItemT[]): boolean => {
    for (const value of values) {
      if (!filterItem(filter, value)) {
        return false;
      }
    }

    if (typeof filter.${syntheticNamePrefix}maxCount !== "undefined" && values.length > filter.${syntheticNamePrefix}maxCount) {
      return false;
    }

    if (typeof filter.${syntheticNamePrefix}minCount !== "undefined" && values.length < filter.${syntheticNamePrefix}minCount) {
      return false;
    }

    return true;
  }
}`,
);
