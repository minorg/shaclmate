import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateTimeFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateTimeFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}dateTimeFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<Date, ${snippets.DateSchema}>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<Date>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toDateTime(options.schema.in) : value.toDateTime()));
}`,
  );
