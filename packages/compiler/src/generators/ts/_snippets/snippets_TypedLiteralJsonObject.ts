import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TypedLiteralJsonObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TypedLiteralJsonObject`,
    code`\
interface ${syntheticNamePrefix}TypedLiteralJsonObject {
  "@type": string;
  "@value": string;
}
  
namespace ${syntheticNamePrefix}TypedLiteralJsonObject {
  export const schema = () => ${imports.z}.object({
    "@type": ${imports.z}.string().min(1),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
