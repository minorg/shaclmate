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
function ${syntheticNamePrefix}floatFromRdfResourceValues<T extends number>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.NumericSchema}<T>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<T>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toFloat(options.schema.in)));
}`,
  );
