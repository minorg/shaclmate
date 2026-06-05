import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_intFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}intFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}intFromRdfResourceValues<IntT extends number>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<IntT, ${snippets.NumericSchema}<IntT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<IntT>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toInt(options.schema.in) : value.toInt() as Either<Error, IntT>));
}`,
  );
