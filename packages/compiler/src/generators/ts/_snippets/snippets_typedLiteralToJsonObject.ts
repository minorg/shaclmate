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
const ${syntheticNamePrefix}typedLiteralToJsonObject: ${snippets.ToJsonObjectFunction}<${imports.Literal}, ${snippets.TypedLiteralJsonObject}> =
  (literal) => ({ "@type": term.datatype.value, "@value": term.value });`,
  );
