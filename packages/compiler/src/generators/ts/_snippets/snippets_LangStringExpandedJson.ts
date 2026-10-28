import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LangStringExpandedJson: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LangStringExpandedJson`,
    code`\
interface ${syntheticNamePrefix}LangStringExpandedJson {
  readonly "@language": string;
  readonly "@value": string;
}
  
namespace LangStringExpandedJson {
  export const schema = () => ${imports.z}.object({
    "@language": ${imports.z}.string().min(1),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
