import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierExpandedJson: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierExpandedJson`,
    code`\
interface ${syntheticNamePrefix}IdentifierExpandedJson {
  readonly "@id": string;
}
  
namespace IdentifierExpandedJson {
  export const schema = ${imports.z}.object({
    "@id": ${imports.z}.string().min(1)
  });
}`,
  );
