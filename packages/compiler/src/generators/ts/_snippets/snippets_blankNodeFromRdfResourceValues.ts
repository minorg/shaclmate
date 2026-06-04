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
function ${syntheticNamePrefix}blankNodeFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.NumericSchema}<${imports.BlankNode}>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.BlankNode}>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toBlankNode()));
}`,
  );
