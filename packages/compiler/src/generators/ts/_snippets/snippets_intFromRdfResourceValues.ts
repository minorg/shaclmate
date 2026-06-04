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
function ${syntheticNamePrefix}intFromRdfResourceValues<T extends number>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<T, ${snippets.NumericSchema}<T>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<T>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toInt(options.schema.in)));
}`,
  );
