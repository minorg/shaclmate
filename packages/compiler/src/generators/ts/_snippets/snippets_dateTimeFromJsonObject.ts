import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeFromJsonObject`,
    code`\
const ${syntheticNamePrefix}dateTimeFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.TypedLiteralJsonObject}, Date, ${snippets.DateSchema}> = 
  (jsonObject) => ${snippets.typedLiteralToJsonObject}(jsonObject).chain(${imports.LiteralDecoder}.decodeDateTimeLiteral);`,
  );
