import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_toIsoDateString: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}toIsoDateString`,
    code`\
export function ${syntheticNamePrefix}toIsoDateString(date: Date): string {
  return date.toISOString().replace(/T.*$/, '')
}`,
  );
