import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashArray`,
    code`\
function ${syntheticNamePrefix}hashArray<ItemT>(hashItem: ${snippets.HashFunction}<ItemT>): ${snippets.HashFunction}<readonly ItemT[]> {
  return (hasher, value) => {
    for (const item of value) {
      hashItem(hasher, item);
    }
  }
}`,
  );
