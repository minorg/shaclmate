import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashString: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashString`,
    code`\
function ${syntheticNamePrefix}hashString<HasherT extends ${snippets.Hasher}>(value: string, hasher: HasherT): HasherT {
  return hasher.update(value);
}`,
  );
