import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierFromJsonString`,
    code`\
const ${syntheticNamePrefix}identifierFromJsonString: ${snippets.FromJsonValueFunction}<string, ${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}> = 
  (jsonValue, options) => jsonValue.startsWith("_:) ? ${snippets.blankNodeFromJsonString}(jsonValue, options) : ${snippets.iriFromJsonString}(jsonValue, options);`,
  );
