import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringToExpandedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringToExpandedJson`,
    code`\
const ${syntheticNamePrefix}stringToExpandedJson: ${snippets.ToExpandedJsonFunction}<string, ${snippets.LiteralExpandedJson}> =
  (value) => ${snippets.literalToExpandedJson}(${snippets.literalFactory}.string(value));`,
  );
