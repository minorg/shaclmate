import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_stringFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}stringFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}stringFromRdfResourceValues<StringT extends string>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<StringT, ${snippets.StringSchema}<StringT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<StringT>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toString(options.schema.in) : value.toString() as ${imports.Either}<Error, StringT>));
}`,
  );
