import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashNumeric: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashNumeric`,
    code`\
const ${syntheticNamePrefix}hashNumeric: ${snippets.HashFunction}<bigint | number> = (hasher, value) => {
  hasher.update(value.toString());
}`,
  );
