import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_mutableSetFromRdfResourceValues: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}mutableSetFromRdfResourceValues`,
    code`\
function ${syntheticNamePrefix}mutableSetFromRdfResourceValues<ItemT, ItemSchemaT>(itemFromRdfResourceValues: ${snippets.FromRdfResourceValuesFunction}<ItemT, ItemSchemaT>): ${snippets.FromRdfResourceValuesFunction}<ItemT[], ${snippets.CollectionSchema}<ItemSchemaT>> {
  const immutableSetFromRdfResourceValues = ${snippets.setFromRdfResourceValues}(itemFromRdfResourceValues);
  return (values, options) => 
    immutableSetFromRdfResourceValues(values, options).map(values => values.map(value => value.concat()));
}`,
  );
