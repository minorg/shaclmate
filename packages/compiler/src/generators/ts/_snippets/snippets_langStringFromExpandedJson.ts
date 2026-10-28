import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}langStringFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.LangStringExpandedJson}, ${imports.Literal}, ${snippets.LangStringSchema}> = 
  (expandedJson, options) => ${imports.Either}.of<Error, ${imports.Literal}>(${imports.dataFactory}.literal(expandedJson["@value"], expandedJson["@language"]))`,
  );
