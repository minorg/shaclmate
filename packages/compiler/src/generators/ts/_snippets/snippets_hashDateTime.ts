import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashDateTime: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashDateTime`,
    code`\
function ${syntheticNamePrefix}hashDateTime<HasherT extends ${snippets.Hasher}>(hasher: HasherT, value: Date): HasherT {
  hasher.update(value.toISOString());
  return hasher;
}`,
  );
