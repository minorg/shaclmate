import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterBoolean: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterBoolean`,
    code`\
const ${syntheticNamePrefix}filterBoolean: ${snippets.FilterFunction}<${snippets.BooleanFilter}, boolean> = (filter, value) => {
  if (filter.value !== undefined && value !== filter.value) {
    return false;
  }

  return true;
}`,
  );
