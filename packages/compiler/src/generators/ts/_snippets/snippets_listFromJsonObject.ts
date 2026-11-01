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
function ${syntheticNamePrefix}listFromJsonObject<ItemJsonObjectT extends object, ItemT, ItemSchemaT>(itemFromJsonObject: ${snippets.FromJsonObjectFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.FromJsonObjectFunction}<{ "@list": ItemJsonObjectT[] }, ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (jsonObject, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromJsonObjectOptions = { schema: schema.itemType, ...otherOptions };
    return ${imports.Either}.sequence(jsonObject["@list"].map(itemJsonObject => itemFromJsonObject(itemJsonObject, itemFromJsonObjectOptions)));
  }
}`,
  );
