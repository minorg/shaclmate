import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashDateTime: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashDateTime`,
    code`\
const ${syntheticNamePrefix}hashDateTime: ${snippets.HashFunction}<Date> = (hasher, value) => {
  hasher.update(value.toISOString());
}`,
  );
