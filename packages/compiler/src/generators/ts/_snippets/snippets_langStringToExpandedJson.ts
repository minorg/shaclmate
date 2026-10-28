import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringToExpandedJson`,
    code`\
const ${syntheticNamePrefix}langStringToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.Literal}, ${snippets.LangStringExpandedJson}> =
  (literal) => ({ "@language": literal.language, "@value": literal.value });`,
  );
