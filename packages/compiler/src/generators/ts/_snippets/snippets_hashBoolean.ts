import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashBoolean: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashBoolean`,
    code`\
const ${syntheticNamePrefix}hashBoolean: ${snippets.HashFunction}<boolean> = (hasher, value) => {
  hasher.update(value.toString());
}`,
  );
