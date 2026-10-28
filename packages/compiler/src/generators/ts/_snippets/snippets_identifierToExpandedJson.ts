import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierToExpandedJson`,
    code`\
const ${syntheticNamePrefix}identifierToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.BlankNode} | ${imports.NamedNode}, string> =
  (identifier) => identifier.termType === "BlankNode" ? ${snippets.blankNodeToExpandedJson}(identifier) : ${snippets.iriToExpandedJson}(identifier);`,
  );
