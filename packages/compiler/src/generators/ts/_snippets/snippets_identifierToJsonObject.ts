import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierToJsonObject`,
    code`\
const ${syntheticNamePrefix}identifierToJsonObject: ${snippets.ToJsonObjectFunction}<${imports.BlankNode} | ${imports.NamedNode}, string> =
  (identifier) => identifier.termType === "BlankNode" ? ${snippets.blankNodeToJsonObject}(identifier) : ${snippets.iriToJsonObject}(identifier);`,
  );
