import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringFromJsonString: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringFromJsonString`,
    code`\
function ${syntheticNamePrefix}stringFromJsonString<StringT extends string>(jsonString: StringT, _options: Parameters<${snippets.FromJsonValueFunction}<StringT, StringT, ${snippets.StringSchema}<StringT>>>[1]): ${imports.Either}<Error, StringT> {
  return ${imports.Either}.of(jsonString);
}`,
  );
