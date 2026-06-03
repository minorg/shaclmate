import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_setFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}setFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}setFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(values, options)\
    .map(values => values.toArray())\
    .map(valuesArray => ${imports.Resource}.Values.fromValue({ focusResource: options.focusResource, propertyPath: options.propertySchema.path, value: valuesArray }));
}`,
  );
