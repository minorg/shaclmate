import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_blankNodeFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}blankNodeFromJsonObject`,
    code`\
const ${syntheticNamePrefix}blankNodeFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.IdentifierJsonObject}, ${imports.BlankNode}, ${snippets.BlankNodeSchema}> = 
  (jsonObject, options) => ${snippets.blankNodeFromJsonString}(jsonObject["@id"], options);`,
  );
