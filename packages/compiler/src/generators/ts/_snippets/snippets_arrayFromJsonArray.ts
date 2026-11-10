import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayFromJsonArray: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayFromJsonArray`,
    code`\
function ${syntheticNamePrefix}arrayFromJsonArray<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<ItemJsonValueT[] | undefined, ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (jsonArray, options) => {
    if (jsonArray === undefined) {
      return ${imports.Either}.of([]);
    }
    const { schema, ...otherOptions } = options;
    const itemFromJsonValueOptions = { schema: schema.itemType, ...otherOptions };
    return ${imports.Either}.sequence(jsonArray.map(itemJsonValue => itemFromJsonValue(itemJsonValue, itemFromJsonValueOptions)));
  }
}`,
  );
