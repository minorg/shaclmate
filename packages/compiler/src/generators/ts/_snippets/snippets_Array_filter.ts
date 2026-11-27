import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Array_filter: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Array.filter`,
    code`\
namespace ${syntheticNamePrefix}Array {
  export function filter<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
    return (filter: ${snippets.CollectionFilter}<ItemFilterT>, values: readonly ItemT[]): boolean => {
      for (const value of values) {
        if (!filterItem(filter, value)) {
          return false;
        }
      }

      if (filter.${syntheticNamePrefix}maxCount !== undefined && values.length > filter.${syntheticNamePrefix}maxCount) {
        return false;
      }

      if (filter.${syntheticNamePrefix}minCount !== undefined && values.length < filter.${syntheticNamePrefix}minCount) {
        return false;
      }

      return true;
    }
  }
}`,
  );
