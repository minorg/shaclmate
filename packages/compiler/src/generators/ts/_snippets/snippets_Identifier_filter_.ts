import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_filter_: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.filter`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const filter: ${snippets.FilterFunction}<${snippets.Identifier_Filter}, ${snippets.Identifier}> = (filter, value) => {
    if (filter.in !== undefined && !filter.in.some(inValue => inValue.equals(value))) {
      return false;
    }

    if (filter.type !== undefined && value.termType !== filter.type) {
      return false;
    }

    return true;
  }
}`,
  );
