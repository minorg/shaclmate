import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Primitive: SnippetFactory = ({ syntheticNamePrefix }) =>
  conditionalOutput(
    `${syntheticNamePrefix}Primitive`,
    code`\
type ${syntheticNamePrefix}Primitive = bigint | boolean | number | string;`,
  );
