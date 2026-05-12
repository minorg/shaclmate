import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterMaybe: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterMaybe`,
    code`\
function ${syntheticNamePrefix}filterMaybe<ItemT, ItemFilterT>(filterItem: (itemFilter: ItemFilterT, item: ItemT) => boolean) {
  return (filter: ${snippets.MaybeFilter}<ItemFilterT>, value: ${imports.Maybe}<ItemT>): boolean => {
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
