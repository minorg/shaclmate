import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listToJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listToJsonObject`,
    code`\
function ${syntheticNamePrefix}listToJsonObject<ItemT, ItemJsonValueT>(itemToJsonValue: ${snippets.ToJsonFunction}<ItemT, ItemJsonValueT>): ${snippets.ToJsonFunction}<readonly ItemT[], { "@list": ItemJsonValueT[] }> {
  return (values) => ({ "@list": values.map(itemToJsonValue) });
}`,
  );
