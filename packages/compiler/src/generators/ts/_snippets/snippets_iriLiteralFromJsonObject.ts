import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriLiteralFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriLiteralFromJsonObject`,
    code`\
function ${syntheticNamePrefix}iriLiteralFromJsonObject<IriT extends string>(jsonObject: ${snippets.IdentifierJsonObject}<IriT>, options: Parameters<${snippets.FromJsonFunction}<${snippets.IdentifierJsonObject}<IriT>, ${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  return ${snippets.iriLiteralFromJsonString}(jsonObject["@id"], options);
}`,
  );
