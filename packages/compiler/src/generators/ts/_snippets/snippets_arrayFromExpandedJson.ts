import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}arrayFromExpandedJson<ItemExpandedJsonT, ItemT, ItemSchemaT>(itemFromExpandedJson: ${snippets.FromExpandedJsonFunction}<ItemExpandedJsonT, ItemT, ItemSchemaT>): ${snippets.FromExpandedJsonFunction}<ItemExpandedJsonT[], ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (arrayExpandedJson, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromExpandedJsonOptions = { ...otherOptions, schema: schema.itemType };
    return ${imports.Either}.sequence(arrayExpandedJson["@list"].map(itemExpandedJson => itemFromExpandedJson(itemExpandedJson, itemFromExpandedJsonOptions)));
  }
}`,
  );
