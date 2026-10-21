import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashMaybe: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashMaybe`,
    code`\
function ${syntheticNamePrefix}hashMaybe<ItemT>(hashItem: ${snippets.HashFunction}<ItemT>): ${snippets.HashFunction}<${imports.Maybe}<ItemT>> {
  return (hasher, value) => {
    value.ifJust(value => {
      hashItem(hasher, value);
    });
  }
}`,
  );
