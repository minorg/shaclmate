import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_mutableListFromRdfResourceValues: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}mutableListFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}mutableListFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  const immutableListFromRdfResourceValues = ${snippets.listFromRdfResourceValues}(itemFromRdfResourceValues);
  return (values, options) => 
    immutableListFromRdfResourceValues(values, options).map(values => values.map(value => value.concat()));
}`,
  );
