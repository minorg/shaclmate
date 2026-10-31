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
const ${syntheticNamePrefix}bigDecimalFromRdfResourceValues = ${snippets.FromRdfResourceValuesFunction}<${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> =
  (values, options) =>
    ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toBigDecimal(options.schema.in)));`,
  );
