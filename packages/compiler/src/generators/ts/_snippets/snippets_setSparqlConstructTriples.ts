import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_SparqlConstructTriplesFunction } from "./snippets_SparqlConstructTriplesFunction.js";

export const snippets_setSparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}setSparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}setSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets_SparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets_SparqlConstructTriplesFunction}<${snippets_CollectionFilter}<ItemFilterT>, ${snippets_CollectionSchema}<ItemSchemaT>> {
  return ({ filter, schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ filter: filter ?? undefined, schema: schema.item(), ...otherParameters });
}`,
);
