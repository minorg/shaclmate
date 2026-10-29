import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeFromExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeFromExpandedJson`,
    code`\
const ${syntheticNamePrefix}dateTimeFromExpandedJson: ${snippets.FromExpandedJsonFunction}<${snippets.TypedLiteralExpandedJson}, Date, ${snippets.DateSchema}> = 
  (expandedJson) => ${snippets.typedLiteralToExpandedJson}(expandedJson).chain(${imports.LiteralDecoder}.decodeDateTimeLiteral);`,
  );
