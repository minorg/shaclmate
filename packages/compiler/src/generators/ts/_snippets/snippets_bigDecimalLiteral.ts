import { xsd } from "@tpluscode/rdf-ns-builders";
import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalLiteral: SnippetFactory = ({
  imports,
  rdfjsTermExpression,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalLiteral`,
    code`\
/**
 * Create a Literal from a BigDecimal.
 */  
function ${syntheticNamePrefix}bigDecimalLiteral(value: ${imports.BigDecimal}): ${imports.Literal} {
  return ${imports.dataFactory}.literal(value.toFixed(), ${rdfjsTermExpression(xsd.decimal)});
}`,
  );
