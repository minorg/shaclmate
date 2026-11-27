import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermJsonObject`,
    code`\
type ${syntheticNamePrefix}TermJsonObject = ${snippets.Identifier_JsonObject} | ${snippets.LiteralJsonObject};
  
namespace ${syntheticNamePrefix}TermJsonObject {
  export const schema = ${imports.z}.union([${snippets.Identifier_JsonObject}.schema, ${snippets.LiteralJsonObject}.schema]);
}`,
  );
