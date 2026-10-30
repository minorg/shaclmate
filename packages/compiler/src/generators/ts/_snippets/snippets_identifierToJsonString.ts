import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierToJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierToJsonString`,
    code`\
const ${syntheticNamePrefix}identifierToJsonString: ${snippets.ToJsonValueFunction}<${imports.BlankNode} | ${imports.NamedNode}, string> =
  (identifier) => identifier.termType === "BlankNode" ? ${snippets.blankNodeToJsonString}(identifier) : ${snippets.iriToJsonString}(identifier);`,
  );
