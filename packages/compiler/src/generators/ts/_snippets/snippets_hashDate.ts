import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashDate: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashDate`,
    code`\
function ${syntheticNamePrefix}hashDate<HasherT extends ${snippets.Hasher}>(hasher: HasherT, value: Date): HasherT {
  hasher.update(${snippets.toIsoDateString}(value));
  return hasher;
}`,
  );
