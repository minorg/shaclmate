import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriLiteralFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriLiteralFromJsonString`,
    code`\
function ${syntheticNamePrefix}iriLiteralFromJsonString<IriT extends string>(jsonString: IriT, _options: Parameters<${snippets.FromJsonFunction}<IriT, ${imports.NamedNode}<IriT>, object>>[1]): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  return ${imports.Right}(${imports.dataFactory}.namedNode(jsonString));
}`,
  );
