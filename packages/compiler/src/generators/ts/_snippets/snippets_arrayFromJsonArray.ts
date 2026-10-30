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
function ${syntheticNamePrefix}arrayFromJsonArray<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonValueFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonValueFunction}<ItemJsonValueT[], ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (arrayJsonValue, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromJsonValueOptions = { ...otherOptions, schema: schema.itemType };
    return ${imports.Either}.sequence(arrayJsonValue.map(itemJsonValue => itemFromJsonValue(itemJsonValue, itemFromJsonValueOptions)));
  }
}`,
  );
