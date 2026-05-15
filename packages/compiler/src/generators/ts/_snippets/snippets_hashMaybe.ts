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
function ${syntheticNamePrefix}hashMaybe<HasherT extends ${snippets.Hasher}, ItemT>(hashItem: ${snippets.HashFunction}<ItemT>): ${snippets.HashFunction}<HasherT, ${imports.Maybe}<ItemT>> {
  return (hasher, value) => {
    value.ifJust(hashItem);
    return hasher;
  }
}`,
  );
