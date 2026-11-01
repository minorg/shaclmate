import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listToJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listToJsonObject`,
    code`\
function ${syntheticNamePrefix}listToJsonObject<ItemT, ItemJsonObjectT extends object>(itemToJsonObject: ${snippets.ToJsonObjectFunction}<ItemT, ItemJsonObjectT>): ${snippets.ToJsonObjectFunction}<ItemT[], { "@list": ItemJsonObjectT[] }> {
  return (values) => ({ "@list": values.map(itemToJsonObject) });
}`,
  );
