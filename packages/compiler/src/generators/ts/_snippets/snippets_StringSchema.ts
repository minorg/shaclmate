import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_StringSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}StringSchema`,
    code`\
interface ${syntheticNamePrefix}StringSchema<StringT extends string> {
  readonly hasValues?: readonly ${imports.Literal}[];
  readonly in?: readonly StringT[];
  readonly languageIn?: readonly string[];
  readonly kind: "String";
}`,
  );
