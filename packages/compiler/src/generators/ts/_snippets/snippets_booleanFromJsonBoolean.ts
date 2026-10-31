import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanFromJsonBoolean: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanFromJsonBoolean`,
    code`\
function ${syntheticNamePrefix}booleanFromJsonBoolean<BooleanT extends boolean>(jsonBoolean: BooleanT, options: Parameters<${snippets.FromJsonValueFunction}<BooleanT, BooleanT, ${snippets.BooleanSchema}<BooleanT>>>[1]): ${imports.Either}<Error, BooleanT> {
  return jsonBoolean;
}`,
  );
