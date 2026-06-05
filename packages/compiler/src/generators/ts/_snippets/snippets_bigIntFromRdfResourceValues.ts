import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_bigIntFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}bigIntFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}bigIntFromRdfResourceValues<BigintT extends bigint>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<BigintT, ${snippets.NumericSchema}<BigintT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<BigintT>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toBigInt(options.schema.in) : value.toBigInt() as ${imports.Either}<Error, BigintT>));
}`,
  );
