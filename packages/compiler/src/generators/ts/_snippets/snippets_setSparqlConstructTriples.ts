import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_setSparqlConstructTriples: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}setSparqlConstructTriples`,
    code`\
function ${syntheticNamePrefix}setSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlConstructTriplesFunction}<${snippets.CollectionFilter}<ItemFilterT>, ${snippets.CollectionSchema}<ItemSchemaT>> {
  return ({ schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, schema: schema.item() });
}`,
  );
