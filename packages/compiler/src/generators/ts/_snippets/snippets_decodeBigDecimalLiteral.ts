import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_decodeBigDecimalLiteral = conditionalOutput(
  `${syntheticNamePrefix}decodeBigDecimalLiteral`,
  code`\
/**
 * Decidoe a BigDecimal from a Literal.
 */  
function ${syntheticNamePrefix}decodeBigDecimalLiteral(literal: ${imports.Literal}): ${imports.Either}<Error, ${imports.BigDecimal}> {
  return ${imports.Either}.encase(() => new ${imports.BigDecimal}(literal.value));
}`,
);
