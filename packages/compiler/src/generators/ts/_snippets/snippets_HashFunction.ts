import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_HashFunction: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}HashFunction`,
    code`\
export type ${syntheticNamePrefix}HashFunction<HasherT extends ${snippets.Hasher}, ValueT> = (hasher: HasherT, value: ValueT) => HasherT;`,
  );
