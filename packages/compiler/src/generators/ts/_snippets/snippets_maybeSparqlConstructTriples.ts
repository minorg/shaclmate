import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_maybeSparqlConstructTriples: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}maybeSparqlConstructTriples`,
    code`\
function ${syntheticNamePrefix}maybeSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlConstructTriplesFunction}<${snippets.MaybeFilter}<ItemFilterT>, ${snippets.MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, filter: filter ?? undefined, schema: schema.item() });
}`,
  );
