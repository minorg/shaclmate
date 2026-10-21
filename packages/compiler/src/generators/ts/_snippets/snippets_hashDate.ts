import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashDate: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashDate`,
    code`\
const ${syntheticNamePrefix}hashDate: ${snippets.HashFunction}<Date> = (hasher, value) => {
  hasher.update(${snippets.toIsoDateString}(value));
}`,
  );
