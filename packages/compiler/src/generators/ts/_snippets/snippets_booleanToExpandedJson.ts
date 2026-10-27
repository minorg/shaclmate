import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanToExpandedJson: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanToExpandedJson`,
    code`\
const ${syntheticNamePrefix}booleanToExpandedJson: ${snippets.ToExpandedJsonFunction}<boolean, ${snippets.LiteralExpandedJson}> =
  (value) => ${snippets.literalToExpandedJson}(${snippets.literalFactory}.boolean(value));`,
  );
