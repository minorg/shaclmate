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
function ${syntheticNamePrefix}iriFromJsonString(jsonString: string, options: Parameters<${snippets.FromJsonFunction}<string, ${imports.NamedNode}, object>>[1]): ${imports.Either}<Error, ${imports.NamedNode}> {
  return ${snippets.iriFromString}(jsonString, options);
}`,
  );
