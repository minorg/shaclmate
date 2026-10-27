import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriFromExpandedJson`,
    code`\
function ${syntheticNamePrefix}iriFromExpandedJson<IriT extends string = string>(expandedJson: ${snippets.IdentifierExpandedJson}<IriT>, options: Parameters<${snippets.FromExpandedJsonFunction}<${snippets.IdentifierExpandedJson}<IriT>, ${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]) {
  return ${snippets.iriFromCompactedJson}(expandedJson["@id"], options);
}`,
  );
