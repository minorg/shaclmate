import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_Filter: SnippetFactory = ({
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.Filter`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export interface Filter {
  }
}`,
  );
