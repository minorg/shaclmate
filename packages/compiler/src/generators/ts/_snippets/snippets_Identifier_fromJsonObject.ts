import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_fromJsonObject: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.fromJsonObject`,
    code`\
namespace ${syntheticNamePrefix}Identifier {    
  export const fromJsonObject: ${snippets.FromJsonFunction}<${snippets.Identifier_JsonObject}, ${snippets.Identifier}, ${snippets.Identifier_Schema}> = 
    (jsonObject, options) => ${snippets.Identifier_fromJsonString}(jsonObject["@id"], options);
}`,
  );
