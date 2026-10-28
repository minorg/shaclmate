import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_literalFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}literalFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}literalFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.LiteralExpandedJson}, ${imports.Literal}, ${snippets.LiteralSchema}> = 
  (expandedJson) => ${imports.Right}(
    ${imports.dataFactory}.literal(
      expandedJson["@value"],
      expandedJson["@language"] !== undefined
        ? expandedJson["@language"]
          : (expandedJson["@type"] !== undefined
            ? ${imports.dataFactory}.namedNode(expandedJson["@type"]!)
              : undefined
    )
  );`,
  );
