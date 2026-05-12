import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_MaybeFilter } from "./snippets_MaybeFilter.js";
import { snippets_MaybeSchema } from "./snippets_MaybeSchema.js";
import { snippets_ValueSparqlConstructTriplesFunction } from "./snippets_ValueSparqlConstructTriplesFunction.js";

export const snippets_maybeSparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}maybeSparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}maybeSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlConstructTriplesFunction}<${snippets.MaybeFilter}<ItemFilterT>, ${snippets.MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, filter: filter ?? undefined, schema: schema.item() });
}`,
);
