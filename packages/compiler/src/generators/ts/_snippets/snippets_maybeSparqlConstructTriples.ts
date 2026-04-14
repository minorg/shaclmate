import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_MaybeFilter } from "./snippets_MaybeFilter.js";
import { snippets_MaybeSchema } from "./snippets_MaybeSchema.js";
import { snippets_SparqlConstructTriplesFunction } from "./snippets_SparqlConstructTriplesFunction.js";

export const snippets_maybeSparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}maybeSparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}maybeSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets_SparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets_SparqlConstructTriplesFunction}<${snippets_MaybeFilter}<ItemFilterT>, ${snippets_MaybeSchema}<ItemSchemaT>> {  
  return ({ filter, schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, filter: filter ?? undefined, schema: schema.item() });
}`,
);
