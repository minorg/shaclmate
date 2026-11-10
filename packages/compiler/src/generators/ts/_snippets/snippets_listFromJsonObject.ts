import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listFromJsonObject`,
    code`\
function ${syntheticNamePrefix}listFromJsonObject<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<{ "@list": ItemJsonValueT[] }, ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (jsonObject, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromJsonValueOptions = { schema: schema.itemType, ...otherOptions };
    return ${imports.Either}.sequence(jsonObject["@list"].map(itemJsonValue => itemFromJsonValue(itemJsonValue, itemFromJsonValueOptions)));
  }
}`,
  );
