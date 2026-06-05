import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_defaultValueFromRdfResourceValues: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}defaultValueFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}defaultValueFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<ItemT, ${snippets.DefaultValueSchema}<ItemSchemaT>> {
  return (values, options) =>
    itemFromRdfResourceValues(
      values.length > 0 ? values : new ${imports.Resource}.Value({ dataFactory: ${imports.dataFactory}, focusResource: options.focusResource, propertyPath: options.propertyPath, term: options.schema.defaultValue }).toValues(),
      { ...options, schema: options.schema.itemType }
    );
}`,
  );
