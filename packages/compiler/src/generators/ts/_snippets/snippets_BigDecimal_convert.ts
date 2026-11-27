import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_convert: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.convert`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {
  export const convert: ${snippets.ConversionFunction}<number | string | ${imports.BigDecimal}, ${imports.BigDecimal}> = (value) =>
    ${imports.Either}.encase(() => new ${imports.BigDecimal}(value));
}`,
  );
