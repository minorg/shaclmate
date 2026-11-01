import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listToJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listToJsonObject`,
    code`\
function ${syntheticNamePrefix}listToJsonObject<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonValueFunction}<ItemT, ItemJsonValueT>): ${snippets.ToJsonObjectFunction}<readonly ItemT[], { "@list": ItemJsonValueT[] }> {
  return (values) => ({ "@list": values.map(itemToJsonValue) });
}`,
  );
