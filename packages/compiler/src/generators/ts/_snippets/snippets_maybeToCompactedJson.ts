import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeToCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeToCompactedJson`,
    code`\
function ${syntheticNamePrefix}maybeToCompactedJson<ItemT, ItemCompactedJsonT>(itemToCompactedJson: ${snippets.ToCompactedJsonFunction}<ItemCompactedJsonT, ItemT, ItemSchemaT>): ${snippets.ToCompactedJsonFunction}<${imports.Maybe}<ItemT>, ItemCompactedJsonT | undefined> {
  return (value) => value.map(value => itemToCompactedJson(value)).extract();
}`,
  );
