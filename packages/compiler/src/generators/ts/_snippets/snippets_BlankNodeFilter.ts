import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNodeFilter: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNodeFilter`,
    code`\
interface ${syntheticNamePrefix}BlankNodeFilter {
}`,
  );
