import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashString`,
    code`\
const ${syntheticNamePrefix}hashString: ${snippets.HashFunction}<string> = (hasher, value) => {
  hasher.update(value);
}`,
  );
