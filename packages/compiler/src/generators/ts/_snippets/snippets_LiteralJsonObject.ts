import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralJsonObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LiteralJsonObject`,
    code`\
interface ${syntheticNamePrefix}LiteralJsonObject {
  "@language"?: string;
  "@type"?: string;
  "@value": string;
}
  
namespace ${syntheticNamePrefix}LiteralJsonObject {
  export const schema = () => ${imports.z}.object({
    "@language": ${imports.z}.string().min(1).optional(),
    "@type": ${imports.z}.string().min(1).optional(),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
