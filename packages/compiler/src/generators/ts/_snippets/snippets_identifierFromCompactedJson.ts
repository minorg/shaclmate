import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierFromCompactedJson`,
    code`\
const ${syntheticNamePrefix}identifierFromCompactedJson: ${snippets.FromCompactedJsonFunction}<string, ${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}> = 
  (compactedJson, options) => compactedJson.startsWith("_:) ? ${snippets.blankNodeFromCompactedJson}(compactedJson, options) : ${snippets.iriFromCompactedJson}(compactedJson, options);`,
  );
