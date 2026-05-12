import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Hasher: SnippetFactory = ({ syntheticNamePrefix }) =>
  conditionalOutput(
    `${syntheticNamePrefix}Hasher`,
    code`type ${syntheticNamePrefix}Hasher = { update: (message: string | number[] | ArrayBuffer | Uint8Array) => void; };`,
  );
