import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalFromJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalFromJsonObject`,
    code`\
const ${syntheticNamePrefix}literalFromJsonObject: ${snippets.FromJsonFunction}<${snippets.LiteralJsonObject}, ${imports.Literal}, undefined> = 
  (jsonObject) => ${imports.Right}(
    ${imports.dataFactory}.literal(
      jsonObject["@value"],
      jsonObject["@language"] !== undefined
        ? jsonObject["@language"]
        : (
            jsonObject["@type"] !== undefined
            ? ${imports.dataFactory}.namedNode(jsonObject["@type"]!)
            : undefined
          )
    )
  );`,
  );
