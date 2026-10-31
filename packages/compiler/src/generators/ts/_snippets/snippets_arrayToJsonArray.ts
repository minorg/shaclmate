import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayToJsonArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayToJsonArray`,
    code`\
function ${syntheticNamePrefix}arrayToJsonArray<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonValueFunction}<ItemT, ItemJsonValueT>): ${snippets.ToJsonValueFunction}<readonly ItemT[], ItemJsonValueT[]> {
  return (values) => values.map(itemToJsonValue);
}`,
  );
