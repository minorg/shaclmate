import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TermExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TermExpandedJson`,
    code`\
type ${syntheticNamePrefix}TermExpandedJson = ${snippets.IdentifierExpandedJson} | ${snippets.LiteralExpandedJson};
  
namespace TermExpandedJson {
  export const schema = () => ${imports.z}.union([${snippets.IdentifierExpandedJson}.schema(), ${snippets.LiteralExpandedJson}.schema()]);
}`,
  );
