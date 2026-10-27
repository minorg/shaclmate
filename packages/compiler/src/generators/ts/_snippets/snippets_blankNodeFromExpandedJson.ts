import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}blankNodeFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.IdentifierExpandedJson}, ${imports.BlankNode}, ${snippets.BlankNodeSchema}> = 
  (expandedJson, options) => ${snippets.blankNodeFromCompactedJson}(expandedJson["@id"], options);`,
  );
