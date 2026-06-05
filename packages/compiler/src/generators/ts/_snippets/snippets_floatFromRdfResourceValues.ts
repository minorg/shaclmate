import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_floatFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}floatFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}floatFromRdfResourceValues<FloatT extends number>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<FloatT, ${snippets.NumericSchema}<FloatT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<FloatT>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toFloat(options.schema.in) : value.toFloat() as ${imports.Either}<Error, FloatT>));
}`,
  );
