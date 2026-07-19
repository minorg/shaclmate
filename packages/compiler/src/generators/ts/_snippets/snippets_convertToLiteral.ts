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
const ${syntheticNamePrefix}convertToLiteral: ${snippets.ConversionFunction}<bigint | boolean | Date | number | string | ${imports.Literal}, ${imports.Literal}> = (value) => {
  if (typeof value === "object") {
    if (value instanceof Date) {
      return ${imports.Either}.of(${snippets.literalFactory}.date(value));
    }
    return ${imports.Either}.of(value);
  }

  return ${imports.Either}.of(${snippets.literalFactory}.primitive(value));
}`,
  );
