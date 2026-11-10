import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_defaultValueFromJsonValue: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}defaultValueFromJsonValue`,
    code`\
function ${syntheticNamePrefix}defaultValueFromJsonValue<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<ItemJsonValueT, ItemT, ${snippets.DefaultValueSchema}<ItemSchemaT>> {
  return (jsonValue, options) => {
    const { schema, ...otherOptions } = options;
    return itemFromJsonValue(jsonValue, { schema: schema.itemType, ...otherOptions });
  }
}`,
  );
