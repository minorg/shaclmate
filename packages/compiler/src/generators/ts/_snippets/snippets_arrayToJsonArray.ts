import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayToJsonArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayToJsonArray`,
    code`\
function ${syntheticNamePrefix}arrayToJsonArray<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonFunction}<ItemT, ItemJsonValueT>): ${snippets.ToJsonFunction}<readonly ItemT[], ItemJsonValueT[]> {
  return (array) => array.map(itemToJsonValue);
}`,
  );
