import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_StringSchema: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}StringSchema`,
    code`\
interface ${syntheticNamePrefix}StringSchema<T extends string> {
  readonly in?: readonly T[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}`,
  );
