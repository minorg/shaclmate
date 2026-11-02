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
function ${syntheticNamePrefix}iriFromJsonString<IriT extends string = string>(jsonValue: IriT, _options: Parameters<${snippets.FromJsonValueFunction}<IriT, ${imports.NamedNode}<IriT>, object>>[1]): ${imports.Either}<Error, ${imports.NamedNode}<IriT>> {
  return ${imports.Either}.of(${imports.dataFactory}.namedNode(jsonValue));
}`,
  );
