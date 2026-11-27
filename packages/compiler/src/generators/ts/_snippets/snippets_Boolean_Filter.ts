import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_Filter: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.Filter`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export interface Filter {
    readonly value?: boolean;
  }
}`,
  );
