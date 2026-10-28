import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}arrayFromCompactedJson<ItemCompactedJsonT, ItemT, ItemSchemaT>(itemFromCompactedJson: ${snippets.FromCompactedJsonFunction}<ItemCompactedJsonT, ItemT, ItemSchemaT>): ${snippets.FromCompactedJsonFunction}<ItemCompactedJsonT[], ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (values, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromCompactedJsonOptions = { ...otherOptions, schema: schema.itemType };
    return ${imports.Either}.sequence(values.map(value => itemFromCompactedJson(value, itemFromCompactedJsonOptions)));
  }
}`,
  );
