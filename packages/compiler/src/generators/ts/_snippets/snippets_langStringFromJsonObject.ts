import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringFromJsonObject`,
    code`\
const ${syntheticNamePrefix}langStringFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.LangStringJsonObject}, ${imports.Literal}, ${snippets.LangStringSchema}> = 
  (jsonObject, options) => ${imports.Either}.of<Error, ${imports.Literal}>(${imports.dataFactory}.literal(jsonObject["@value"], jsonObject["@language"]))`,
  );
