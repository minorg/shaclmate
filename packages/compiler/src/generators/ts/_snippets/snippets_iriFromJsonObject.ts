import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriFromJsonObject`,
    code`\
function ${syntheticNamePrefix}iriFromJsonObject(jsonObject: ${snippets.Identifier_JsonObject}, options: Parameters<${snippets.FromJsonFunction}<${snippets.Identifier_JsonObject}, ${imports.NamedNode}, ${snippets.IriSchema}>>[1]): ${imports.Either}<Error, ${imports.NamedNode}> {
  return ${snippets.iriFromJsonString}(jsonObject["@id"], options);
}`,
  );
