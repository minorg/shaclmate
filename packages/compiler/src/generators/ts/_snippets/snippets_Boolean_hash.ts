import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_hash: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.hash`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export const hash: ${snippets.HashFunction}<boolean> = (hasher, value) => {
    hasher.update(value.toString());
  }
}`,
  );
