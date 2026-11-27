import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_BigDecimal_fromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}BigDecimal.fromRdfResourceValues`,
    code`\
namespace ${syntheticNamePrefix}BigDecimal {    
  export const fromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<${imports.BigDecimal}, ${snippets.NumericSchema}<${imports.BigDecimal}>> =
    (values, options) =>
      ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toBigDecimal(options.schema.in)));
}`,
  );
