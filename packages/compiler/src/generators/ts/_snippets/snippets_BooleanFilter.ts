import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BooleanFilter: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BooleanFilter`,
    code`\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
  );
