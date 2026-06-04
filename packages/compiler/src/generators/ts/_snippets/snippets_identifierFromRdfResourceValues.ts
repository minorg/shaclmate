import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}identifierFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.BlankNode} | ${imports.NamedNode}>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toIdentifier()));
}`,
  );
