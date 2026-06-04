import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigDecimalFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigDecimalFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}bigDecimalFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.NumericSchema}<${imports.BigDecimal}>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.BigDecimal}>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toLiteral().chain(${snippets.decodeBigDecimalLiteral})));
}`,
  );
