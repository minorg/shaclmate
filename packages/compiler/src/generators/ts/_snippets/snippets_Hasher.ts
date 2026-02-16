import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Hasher = conditionalOutput(
  `${syntheticNamePrefix}Hasher`,
  code`type ${syntheticNamePrefix}Hasher = { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; };`,
);
