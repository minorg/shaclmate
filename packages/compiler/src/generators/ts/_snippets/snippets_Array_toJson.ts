import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Array_toJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Array.toJson`,
    code`\
namespace ${syntheticNamePrefix}Array {
  export function toJson<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonFunction}<ItemT, ItemJsonValueT>): ${snippets.ToJsonFunction}<readonly ItemT[], ItemJsonValueT[]> {
    return (array) => array.map(itemToJsonValue);
  }
}`,
  );
