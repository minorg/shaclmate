import { code, conditionalOutput } from "ts-poet";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export const snippets_Hasher = conditionalOutput(
  `${syntheticNamePrefix}Hasher`,
  code`{ update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; }`,
);
