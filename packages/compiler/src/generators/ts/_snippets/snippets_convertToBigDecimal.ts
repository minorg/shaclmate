import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_convertToBigDecimal: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}convertToBigDecimal`,
    code`\
const ${syntheticNamePrefix}convertToBigDecimal: ${snippets.ConversionFunction}<number | string | ${imports.BigDecimal}, ${imports.BigDecimal}> = (value) =>
  ${imports.Either}.encase(() => new ${imports.BigDecimal}(value));`,
  );
