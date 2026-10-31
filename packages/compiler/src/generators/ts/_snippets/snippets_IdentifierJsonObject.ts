import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_IdentifierJsonObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}IdentifierJsonObject`,
    code`\
interface ${syntheticNamePrefix}IdentifierJsonObject<IdT extends string = string> {
  readonly "@id": IdT;
}
  
namespace IdentifierJsonObject {
  export const schema = () => ${imports.z}.object({
    "@id": ${imports.z}.string().min(1)
  });
}`,
  );
