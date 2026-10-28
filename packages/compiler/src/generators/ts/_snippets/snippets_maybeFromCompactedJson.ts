import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}maybeFromCompactedJson<ItemCompactedJsonT, ItemT, ItemSchemaT>(itemFromCompactedJson: ${snippets.FromCompactedJsonFunction}<ItemCompactedJsonT, ItemT, ItemSchemaT>): ${snippets.FromCompactedJsonFunction}<ItemCompactedJsonT | undefined, ${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (value, options) => {
    const { schema, ...otherOptions } = options;
    const itemFromCompactedJsonOptions = { ...otherOptions, schema: schema.itemType };
    if (value === undefined) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    return itemFromCompactedJson(value).map(value => ${imports.Maybe}.of(value));
  };
}`,
  );
