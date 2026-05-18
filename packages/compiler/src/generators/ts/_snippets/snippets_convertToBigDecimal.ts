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
function ${syntheticNamePrefix}convertToBigDecimal(_schema: ${snippets.NumericSchema}<${imports.BigDecimal}>, value: ${imports.BigDecimal}): ${imports.Either}<Error, ${imports.BigDecimal}> {
  return ${imports.Either}.of(value);
}`,
  );
