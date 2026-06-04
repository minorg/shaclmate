import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_dateFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}dateFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}dateFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<Date, ${snippets.DateSchema}>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<Date>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toDate(options.schema.in) : value.toDate()));
}`,
  );
