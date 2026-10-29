import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_typedLiteralToExpandedJson: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}typedLiteralToExpandedJson`,
    code`\
const ${syntheticNamePrefix}typedLiteralToExpandedJson: ${snippets.ToExpandedJsonFunction}<${imports.Literal}, ${snippets.TypedLiteralExpandedJson}> =
  (literal) => ({ "@type": term.datatype.value, "@value": term.value });`,
  );
