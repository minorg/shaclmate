import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriFromCompactedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriFromCompactedJson`,
    code`\
function ${syntheticNamePrefix}iriFromCompactedJson<IriT extends string = string>(compactedJson: IriT, options: Parameters<${snippets.FromCompactedJsonFunction}<IriT, ${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]) {
  return ${imports.dataFactory}.namedNode(compactedJson);
}`,
  );
