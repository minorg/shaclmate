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
const ${syntheticNamePrefix}literalFromJsonObject: ${snippets.FromJsonObjectFunction}<${snippets.LiteralJsonObject}, ${imports.Literal}, ${snippets.LiteralSchema}> = 
  (jsonObject) => ${imports.Right}(
    ${imports.dataFactory}.literal(
      jsonObject["@value"],
      jsonObject["@language"] !== undefined
        ? jsonObject["@language"]
          : (jsonObject["@type"] !== undefined
            ? ${imports.dataFactory}.namedNode(jsonObject["@type"]!)
              : undefined
    )
  );`,
  );
