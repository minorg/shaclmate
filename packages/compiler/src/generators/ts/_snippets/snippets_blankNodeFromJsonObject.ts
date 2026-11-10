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
const ${syntheticNamePrefix}blankNodeFromJsonObject: ${snippets.FromJsonFunction}<${snippets.IdentifierJsonObject}, ${imports.BlankNode}, undefined> = 
  (jsonObject) => ${snippets.blankNodeFromJsonString}(jsonObject["@id"]);`,
  );
