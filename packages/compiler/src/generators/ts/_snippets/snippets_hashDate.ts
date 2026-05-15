import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashDate: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashDate`,
    code`\
function ${syntheticNamePrefix}hashDate<HasherT extends ${snippets.Hasher}>(value: Date, hasher: HasherT): HasherT {
  return hasher.update(${snippets.toIsoDateString}(value));
}`,
  );
