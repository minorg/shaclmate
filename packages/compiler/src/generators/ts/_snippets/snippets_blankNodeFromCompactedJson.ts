import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromCompactedJson`,
    code`\
const ${syntheticNamePrefix}blankNodeFromCompactedJson: ${snippets.FromCompactedJsonFunction}<string, ${imports.BlankNode}, ${snippets.BlankNodeSchema}> = 
  (compactedJson) => ${imports.Right}(${imports.dataFactory}.blankNode(compactedJson.substring(2)));`,
  );
