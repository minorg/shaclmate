import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_filter_: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.filter`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export const filter: ${snippets.FilterFunction}<${snippets.Boolean_Filter}, boolean> = (filter, value) => {
    if (filter.value !== undefined && value !== filter.value) {
      return false;
    }

    return true;
  }
}`,
  );
