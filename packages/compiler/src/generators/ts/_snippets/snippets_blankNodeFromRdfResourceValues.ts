import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}blankNodeFromRdfResourceValues(values: ${imports.Resource}.Values, _options: Parameters<${snippets.FromRdfResourceValuesFunction}<${imports.BlankNode}, ${snippets.BlankNodeSchema}>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.BlankNode}>> {
  return values.chainMap(value => value.toBlankNode());
}`,
  );
