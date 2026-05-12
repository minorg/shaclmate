import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_filterBlankNode: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}filterBlankNode`,
    code`\
function ${syntheticNamePrefix}filterBlankNode(_filter: ${snippets.BlankNodeFilter}, _value: ${imports.BlankNode}) {
  return true;
}`,
  );
