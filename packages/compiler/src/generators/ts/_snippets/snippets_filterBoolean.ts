import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterBoolean: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterBoolean`,
    code`\
function ${syntheticNamePrefix}filterBoolean(filter: ${snippets.BooleanFilter}, value: boolean) {
  if (filter.value !== undefined && value !== filter.value) {
    return false;
  }

  return true;
}`,
  );
