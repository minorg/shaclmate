import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalLiteral: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalLiteral`,
    code`\
/**
 * Create a Literal from a BigDecimal.
 */  
function ${syntheticNamePrefix}bigDecimalLiteral(value: ${this.imports.BigDecimal}): ${this.imports.Literal} {
  return ${this.imports.dataFactory}.literal(value.toFixed(), ${this.snippets.RdfVocabularies}.xsd.decimal);
}`,
  );
