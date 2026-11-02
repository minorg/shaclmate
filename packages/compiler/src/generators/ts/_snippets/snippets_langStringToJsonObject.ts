import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringToJsonObject`,
    code`\
const ${syntheticNamePrefix}langStringToJsonObject: ${snippets.ToJsonObjectFunction}<${imports.Literal}, ${snippets.LangStringJsonObject}> =
  (literal) => ({ "@language": literal.language, "@value": literal.value });`,
  );
