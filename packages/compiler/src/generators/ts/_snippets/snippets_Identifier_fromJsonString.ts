import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Identifier_fromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Identifier.fromJsonString`,
    code`\
namespace ${syntheticNamePrefix}Identifier {
  export const fromJsonString: ${snippets.FromJsonFunction}<string, ${snippets.Identifier}, ${snippets.Identifier_Schema}> = 
    (jsonString, options) => jsonString.startsWith("_:") ? ${snippets.BlankNode_fromJsonString}(jsonString, options) as ${imports.Either}<Error, ${snippets.Identifier}> : ${snippets.iriFromJsonString}(jsonString, options) as ${imports.Either}<Error, ${snippets.Identifier}>;
}`,
  );
