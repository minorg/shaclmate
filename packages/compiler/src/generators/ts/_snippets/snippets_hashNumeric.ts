import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_hashNumeric: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}hashNumeric`,
    code`\
function ${syntheticNamePrefix}hashNumeric<HasherT extends ${snippets.Hasher}>(value: bigint | number, hasher: HasherT): HasherT {
  return hasher.update(value.toString());
}`,
  );
