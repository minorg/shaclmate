import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_typedLiteralToJsonObject: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}typedLiteralToJsonObject`,
    code`\
const ${syntheticNamePrefix}typedLiteralToJsonObject: ${snippets.ToJsonFunction}<${imports.Literal}, ${snippets.TypedLiteralJsonObject}> =
  (literal) => ({ "@type": literal.datatype.value, "@value": literal.value });`,
  );
