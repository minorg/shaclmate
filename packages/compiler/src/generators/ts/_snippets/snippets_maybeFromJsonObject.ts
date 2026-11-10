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
function ${syntheticNamePrefix}maybeFromJsonObject<ItemJsonObjectT extends object, ItemT, ItemSchemaT>(itemFromJsonObject: ${snippets.FromJsonFunction}<ItemJsonObjectT, ItemT, ItemSchemaT>): ${snippets.FromJsonFunction}<ItemJsonObjectT | undefined, ${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (value, options) => {
    if (value === undefined) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    const { schema, ...otherOptions } = options;
    return itemFromJsonObject(value, { schema: schema.itemType, ...otherOptions }).map(value => ${imports.Maybe}.of(value));
  };
}`,
  );
