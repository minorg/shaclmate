import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DateSchema: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}DateSchema`,
    code`\
interface ${syntheticNamePrefix}DateSchema {
  readonly hasValues?: readonly ${imports.Literal}[];
  readonly in?: readonly Date[];
  readonly kind: "Date" | "DateTime",
}`,
  );
