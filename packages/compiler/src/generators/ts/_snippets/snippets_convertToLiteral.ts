import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToLiteral: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToLiteral`,
    code`\
function ${syntheticNamePrefix}convertToLiteral(_schema: ${snippets.LiteralSchema}, value: bigint | boolean | Date | number | string | ${imports.Literal}): ${imports.Literal} {
  if (typeof value === "object") {
    if (value instanceof Date) {
      return ${snippets.literalFactory}.date(value);
    }
    return value;
  }

  return ${snippets.literalFactory}.primitive(value);
}`,
  );
