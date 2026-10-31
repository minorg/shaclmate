import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromJsonObject`,
    code`\
const ${syntheticNamePrefix}dateFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, Date, ${snippets.DateSchema}> = 
  (jsonObject) => ${snippets.literalFromJsonObject}(jsonObject).chain(${imports.LiteralDecoder}.decodeDateLiteral);`,
  );
