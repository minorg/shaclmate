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
function ${syntheticNamePrefix}iriFromJsonObject<IriT extends string = string>(jsonObject: ${snippets.IdentifierJsonObject}<IriT>, options: Parameters<${snippets.FromJsonObjectFunction}<${snippets.IdentifierJsonObject}<IriT>, ${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  return ${snippets.iriFromJsonString}(jsonObject["@id"], options);
}`,
  );
