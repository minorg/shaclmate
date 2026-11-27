import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Array_hash: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Array.hash`,
    code`\
namespace ${syntheticNamePrefix}Array {
  export function hash<ItemT>(hashItem: ${snippets.HashFunction}<ItemT>): ${snippets.HashFunction}<readonly ItemT[]> {
    return (hasher, value) => {
      for (const item of value) {
        hashItem(hasher, item);
      }
    }
  }
}`,
  );
