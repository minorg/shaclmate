import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeToExpandedJson`,
    code`\
const ${syntheticNamePrefix}blankNodeToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.BlankNode}, ${snippets.IdentifierExpandedJson}> =
  (blankNode) => { "@id": ${snippets.blankNodeToCompactedJson}(blankNode) };`,
  );
