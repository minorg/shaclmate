import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}identifierFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.IdentifierExpandedJson}, ${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}> = 
  (expandedJson, options) => expandedJson["@id"].startsWith("_:") ? ${snippets.blankNodeFromExpandedJson}(expandedJson, options) : ${snippets.iriFromExpandedJson}(expandedJson, options);`,
  );
