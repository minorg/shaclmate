import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}maybeFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<${imports.Maybe}<ItemT>, ${snippets.MaybeSchema}<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, { ...options, schema: options.schema.itemType })\
      .map(values => values.length > 0
        ? values.map(value => ${imports.Maybe}.of(value))
        : ${imports.Resource}.Values.fromValue<${imports.Maybe}<ItemT>>({ focusResource: options.focusResource, propertyPath: options.propertyPath, value: ${imports.Maybe}.empty() })
      );
}`,
  );
