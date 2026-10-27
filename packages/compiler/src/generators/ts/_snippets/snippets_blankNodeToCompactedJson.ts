import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeToCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeToCompactedJson`,
    code`\
const ${syntheticNamePrefix}blankNodeToCompactedJson: ${snippets.ToCompactedJsonFunction}<${imports.BlankNode}, string> =
  (blankNode) => \`_:\${blankNode.value}\`;`,
  );
