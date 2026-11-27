import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Array_fromJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Array.fromJson`,
    code`\
namespace ${syntheticNamePrefix}Array {    
  export function fromJson<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<ItemJsonValueT[] | undefined, ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
    return (jsonArray, options) => {
      if (jsonArray === undefined) {
        return ${imports.Either}.of([]);
      }
      const { schema, ...otherOptions } = options;
      const itemFromJsonValueOptions = { schema: schema.itemType, ...otherOptions };
      return ${imports.Either}.sequence(jsonArray.map(itemJsonValue => itemFromJsonValue(itemJsonValue, itemFromJsonValueOptions)));
    }
  }
}`,
  );
