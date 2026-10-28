import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeToExpandedJson`,
    code`\
function ${syntheticNamePrefix}maybeToExpandedJson<ItemT, ItemExpandedJsonT>(itemToExpandedJson: ${snippets.ToExpandedJsonFunction}<ItemExpandedJsonT, ItemT, ItemSchemaT>): ${snippets.ToExpandedJsonFunction}<${imports.Maybe}<ItemT>, ItemExpandedJsonT | undefined> {
  return (value) => value.map(value => itemToExpandedJson(value)).extract();
}`,
  );
