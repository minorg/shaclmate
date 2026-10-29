import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}dateFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.TypedLiteralExpandedJson}, Date, ${snippets.DateSchema}> = 
  (expandedJson) => ${snippets.literalFromExpandedJson}(expandedJson).chain(${imports.LiteralDecoder}.decodeDateLiteral);`,
  );
