import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_RdfVocabularies } from "./snippets_RdfVocabularies.js";

export const snippets_bigDecimalLiteral = conditionalOutput(
  `${syntheticNamePrefix}bigDecimalLiteral`,
  code`\
/**
 * Create a Literal from a BigDecimal.
 */  
function ${syntheticNamePrefix}bigDecimalLiteral(value: ${imports.BigDecimal}): ${imports.Literal} {
  return ${imports.dataFactory}.literal(value.toFixed(), ${snippets_RdfVocabularies}.xsd.decimal);
}`,
);
