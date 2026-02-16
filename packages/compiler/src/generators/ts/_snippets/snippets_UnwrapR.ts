import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

// export const UnwrapL = `type ${syntheticNamePrefix}UnwrapL<T> = T extends ${imports.Either}<infer L, any> ? L : never`;
export const snippets_UnwrapR = conditionalOutput(
  `${syntheticNamePrefix}UnwrapR`,
  code`type ${syntheticNamePrefix}UnwrapR<T> = T extends ${imports.Either}<any, infer R> ? R : never;`,
);
