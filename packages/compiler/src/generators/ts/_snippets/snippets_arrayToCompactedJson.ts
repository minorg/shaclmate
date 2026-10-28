import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_arrayToCompactedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}arrayToCompactedJson`,
    code`\
function ${syntheticNamePrefix}arrayToCompactedJson<ItemT, ItemCompactedJsonT>(itemToCompactedJson: ${snippets.ToCompactedJsonFunction}<ItemCompactedJsonT, ItemT, ItemSchemaT>): ${snippets.ToCompactedJsonFunction}<ItemT[], ItemCompactedJsonT[]> {
  return (values) => values.map(itemToCompactedJson);
}`,
  );
