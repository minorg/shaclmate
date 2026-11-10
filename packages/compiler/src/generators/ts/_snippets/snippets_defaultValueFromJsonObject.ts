import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_defaultValueFromJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}defaultValueFromJsonObject`,
    code`\
function ${syntheticNamePrefix}defaultValueFromJsonObject<ItemJsonObjectT extends object, ItemT, ItemSchemaT>(itemFromJsonObject: ${snippets.FromJsonFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<ItemJsonObjectT, ItemT, ${snippets.DefaultValueSchema}<ItemSchemaT>> {
  return (jsonObject, options) => {
    const { schema, ...otherOptions } = options;
    return itemFromJsonObject(jsonObject, { schema: schema.itemType, ...otherOptions });
  }
}`,
  );
