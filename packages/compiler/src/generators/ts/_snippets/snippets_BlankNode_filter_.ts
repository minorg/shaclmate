import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BlankNode_filter_: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BlankNode.filter`,
    code`\
namespace ${syntheticNamePrefix}BlankNode {
  export const filter: ${snippets.FilterFunction}<${snippets.BlankNode_Filter}, ${imports.BlankNode}> = () => true;
}`,
  );
