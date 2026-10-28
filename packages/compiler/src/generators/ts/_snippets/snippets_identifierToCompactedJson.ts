import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierToCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierToCompactedJson`,
    code`\
const ${syntheticNamePrefix}identifierToCompactedJson: ${snippets.ToCompactedJsonFunction}<${imports.BlankNode} | ${imports.NamedNode}, string> =
  (identifier) => identifier.termType === "BlankNode" ? ${snippets.blankNodeToCompactedJson}(identifier) : ${snippets.iriToCompactedJson}(identifier);`,
  );
