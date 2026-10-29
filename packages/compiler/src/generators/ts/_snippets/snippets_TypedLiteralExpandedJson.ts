import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_TypedLiteralExpandedJson: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}TypedLiteralExpandedJson`,
    code`\
interface ${syntheticNamePrefix}TypedLiteralExpandedJson {
  readonly "@type": string;
  readonly "@value": string;
}
  
namespace TypedLiteralExpandedJson {
  export const schema = () => ${imports.z}.object({
    "@type": ${imports.z}.string().min(1),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
