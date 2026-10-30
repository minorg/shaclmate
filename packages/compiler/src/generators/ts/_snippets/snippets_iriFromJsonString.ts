import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriFromJsonString`,
    code`\
function ${syntheticNamePrefix}iriFromJsonString<IriT extends string = string>(jsonValue: IriT, options: Parameters<${snippets.FromJsonValueFunction}<IriT, ${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]) {
  return ${imports.dataFactory}.namedNode(jsonValue);
}`,
  );
