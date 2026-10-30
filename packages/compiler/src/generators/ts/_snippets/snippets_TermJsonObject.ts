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
type ${syntheticNamePrefix}TermJsonObject = ${snippets.IdentifierJsonObject} | ${snippets.LiteralJsonObject};
  
namespace TermJsonObject {
  export const schema = () => ${imports.z}.union([${snippets.IdentifierJsonObject}.schema(), ${snippets.LiteralJsonObject}.schema()]);
}`,
  );
