import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayFromJsonObject`,
    code`\
function ${syntheticNamePrefix}arrayFromJsonObject<ItemJsonObjectT, ItemT, ItemSchemaT>(itemFromJsonObject: ${snippets.FromJsonObjectFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.FromJsonObjectFunction}<ItemJsonObjectT[], ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (arrayJsonObject, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromJsonObjectOptions = { ...otherOptions, schema: schema.itemType };
    return ${imports.Either}.sequence(arrayJsonObject["@list"].map(itemJsonObject => itemFromJsonObject(itemJsonObject, itemFromJsonObjectOptions)));
  }
}`,
  );
