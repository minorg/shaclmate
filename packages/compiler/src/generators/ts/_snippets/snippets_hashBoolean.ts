import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashBoolean: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashBoolean`,
    code`\
function ${syntheticNamePrefix}hashBoolean<HasherT extends ${snippets.Hasher}>(hasher: HasherT, value: boolean): HasherT {
  hasher.update(value.toString());
  return hasher;
}`,
  );
