import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_booleanFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}booleanFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}booleanFromRdfResourceValues<BooleanT extends boolean>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<BooleanT, ${snippets.BooleanSchema}<BooleanT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<BooleanT>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toBoolean(options.schema.in) : value.toBoolean() as ${imports.Either}<Error, BooleanT>));
}`,
  );
