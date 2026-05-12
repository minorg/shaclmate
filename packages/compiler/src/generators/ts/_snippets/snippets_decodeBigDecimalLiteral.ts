import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_decodeBigDecimalLiteral: SnippetFactory = ({
  imports,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}decodeBigDecimalLiteral`,
    code`\
/**
 * Decidoe a BigDecimal from a Literal.
 */  
function ${syntheticNamePrefix}decodeBigDecimalLiteral(literal: ${this.imports.Literal}): ${this.imports.Either}<Error, ${this.imports.BigDecimal}> {
  return ${this.imports.Either}.encase(() => new ${this.imports.BigDecimal}(literal.value));
}`,
  );
