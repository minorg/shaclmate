import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_termFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}termFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}termFromRdfResourceValues<T extends ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.TermSchema}<T>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<T>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toTerm()));
}`,
  );
