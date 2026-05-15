import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashString`,
    code`\
function ${syntheticNamePrefix}hashString<HasherT extends ${snippets.Hasher}>(hasher: HasherT, value: string): HasherT {
  return hasher.update(value);
}`,
  );
