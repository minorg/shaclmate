import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_LangStringJsonObject: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}LangStringJsonObject`,
    code`\
interface ${syntheticNamePrefix}LangStringJsonObject {
  "@language": string;
  "@value": string;
}
  
namespace ${syntheticNamePrefix}LangStringJsonObject {
  export const schema = () => ${imports.z}.object({
    "@language": ${imports.z}.string().min(1),
    "@value": ${imports.z}.string().min(1)
  });
}`,
  );
