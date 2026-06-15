import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_langStringFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}langStringFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}langStringFromRdfResourceValues(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<${imports.Literal}, ${snippets.LangStringSchema}>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.Literal}>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => value.toLangString(options.schema.in)));
}`,
  );
