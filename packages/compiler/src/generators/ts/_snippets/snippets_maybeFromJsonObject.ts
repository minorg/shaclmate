import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeFromJsonObject`,
    code`\
function ${syntheticNamePrefix}maybeFromJsonObject<ItemJsonObjectT extends object, ItemT, ItemSchemaT>(itemFromJsonObject: ${snippets.FromJsonObjectFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.FromJsonObjectFunction}<ItemJsonObjectT | undefined, ${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (value, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromJsonObjectOptions = { ...otherOptions, schema: schema.itemType };
    if (value === undefined) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    return itemFromJsonObject(value).map(value => ${imports.Maybe}.of(value));
  };
}`,
  );
