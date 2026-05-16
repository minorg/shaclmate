import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashArray: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashArray`,
    code`\
function ${syntheticNamePrefix}hashArray<HasherT extends ${snippets.Hasher}, ItemT>(hashItem: ${snippets.HashFunction}<HasherT, ItemT>): ${snippets.HashFunction}<HasherT, readonly ItemT[]> {
  return (hasher, value) => {
    for (const item of value) {
      hashItem(hasher, item);
    }
    return hasher;
  }
}`,
  );
