import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}maybeFromExpandedJson<ItemExpandedJsonT extends object, ItemT, ItemSchemaT>(itemFromExpandedJson: ${snippets.FromExpandedJsonFunction}<ItemExpandedJsonT, ItemT, ItemSchemaT>): ${snippets.FromExpandedJsonFunction}<ItemExpandedJsonT | undefined, ${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (value, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromExpandedJsonOptions = { ...otherOptions, schema: schema.itemType };
    if (value === undefined) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    return itemFromExpandedJson(value).map(value => ${imports.Maybe}.of(value));
  };
}`,
  );
