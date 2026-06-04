import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_iriFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}iriFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}iriFromRdfResourceValues<IriT extends string = string>(values: ${imports.Resource}.Values, options: Parameters<${snippets.FromRdfResourceValuesFunction}<${imports.NamedNode}<IriT>, ${snippets.IriSchema}<IriT>>>[1]): ${imports.Either}<Error, ${imports.Resource}.Values<${imports.NamedNode}<IriT>>> {
  return ${snippets.termLikeFromRdfResourceValues}(values, options).chain(values => values.chainMap(value => options.schema.in ? value.toIri(options.schema.in) : value.toIri() as  as ${imports.Either}<Error, ${imports.NamedNode}<IriT>>));
}`,
  );
