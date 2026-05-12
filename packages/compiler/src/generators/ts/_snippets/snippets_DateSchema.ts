import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_DateSchema: SnippetFactory = ({ syntheticNamePrefix }) =>
  conditionalOutput(
    `${syntheticNamePrefix}DateSchema`,
    code`\
interface ${syntheticNamePrefix}DateSchema {
  in?: readonly Date[];
  kind: "Date" | "DateTime",
}`,
  );
