import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_Boolean_fromJsonBoolean: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}Boolean.fromJsonBoolean`,
    code`\
namespace ${syntheticNamePrefix}Boolean {
  export function fromJsonBoolean<BooleanT extends boolean>(jsonBoolean: BooleanT, _options: Parameters<${snippets.FromJsonFunction}<BooleanT, BooleanT, ${snippets.Boolean_Schema}<BooleanT>>>[1]): ${imports.Either}<Error, BooleanT> {
    return ${imports.Either}.of(jsonBoolean);
  }
}`,
  );
