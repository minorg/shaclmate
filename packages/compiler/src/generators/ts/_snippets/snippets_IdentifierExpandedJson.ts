import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierExpandedJson: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierExpandedJson`,
    code`\
interface ${syntheticNamePrefix}IdentifierExpandedJson<IdT extends string = string> {
  readonly "@id": IdT;
}
  
namespace IdentifierExpandedJson {
  export const schema = () => ${imports.z}.object({
    "@id": ${imports.z}.string().min(1)
  });
}`,
  );
