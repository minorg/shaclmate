import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

// export const UnwrapL = `type ${syntheticNamePrefix}UnwrapL<T> = T extends ${imports.Either}<infer L, any> ? L : never`;
export const snippets_UnwrapR: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}UnwrapR`,
    code`type ${syntheticNamePrefix}UnwrapR<T> = T extends ${imports.Either}<any, infer R> ? R : never;`,
  );
