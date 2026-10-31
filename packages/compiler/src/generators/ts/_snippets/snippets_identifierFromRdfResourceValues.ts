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
const ${syntheticNamePrefix}identifierFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}> =
  (values, options) => ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toIdentifier()));`,
  );
