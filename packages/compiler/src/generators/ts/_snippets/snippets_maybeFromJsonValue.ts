import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeFromJsonValue: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeFromJsonValue`,
    code`\
function ${syntheticNamePrefix}maybeFromJsonValue<ItemJsonValueT, ItemT, ItemSchemaT>(itemFromJsonValue: ${snippets.FromJsonValueFunction}<ItemJsonValueT, ItemT, ItemSchemaT>): ${snippets.FromJsonValueFunction}<ItemJsonValueT | undefined, ${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (value, options) => {
    if (value === undefined) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    const { schema, ...otherOptions } = options;
    return itemFromJsonValue(value, { ...otherOptions, schema: schema.itemType }).map(value => ${imports.Maybe}.of(value));
  };
}`,
  );
