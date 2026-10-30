import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_identifierFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}identifierFromJsonObject`,
    code`\
const ${syntheticNamePrefix}identifierFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.IdentifierJsonObject}, ${imports.BlankNode} | ${imports.NamedNode}, ${snippets.IdentifierSchema}> = 
  (jsonObject, options) => jsonObject["@id"].startsWith("_:") ? ${snippets.blankNodeFromJsonObject}(jsonObject, options) : ${snippets.iriFromJsonObject}(jsonObject, options);`,
  );
