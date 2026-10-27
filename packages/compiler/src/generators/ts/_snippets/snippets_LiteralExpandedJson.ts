import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LiteralExpandedJson: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LiteralExpandedJson`,
    code`\
interface ${syntheticNamePrefix}LiteralExpandedJson<ValueT extends string = string> {
  readonly "@language"?: string;
  readonly "@type"?: string;
  readonly "@value": ValueT;
}
  
namespace LiteralExpandedJson {
  export const schema = () => ${imports.z}.object({
    "@language": ${imports.z}.string().min(1).optional(),
    "@type": ${imports.z}.string().min(1).optional(),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
