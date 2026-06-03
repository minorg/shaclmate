import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}listFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (values, options) =>
    values\
      .chainMap(value => value.toList({ graph: options.graph }))\ // Resource.Values<Resource.Value> to Resource.Values<Resource.Values>;
      .chain(valueLists => valueLists.chainMap(valueList =>
        itemFromRdfResourceValues(
          ${imports.Right}(${imports.Resource}.Values.fromArray({ focusResource: options.focusResource, propertyPath: options.propertyPath, values: valueList.toArray() })),
          { ...options, schema: options.schema.itemType }
        )
      ))\ // Resource.Values<Resource.Values> to Resource.Values<item type arrays>
      .map(valueLists => valueLists.map(valueList => valueList.toArray())); // Convert inner Resource.Values to arrays
}`,
  );
