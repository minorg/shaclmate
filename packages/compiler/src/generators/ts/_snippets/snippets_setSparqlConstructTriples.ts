import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_ValueSparqlConstructTriplesFunction } from "./snippets_ValueSparqlConstructTriplesFunction.js";

export const snippets_setSparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}setSparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}setSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlConstructTriplesFunction}<${snippets.CollectionFilter}<ItemFilterT>, ${snippets.CollectionSchema}<ItemSchemaT>> {
  return ({ schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, schema: schema.item() });
}`,
);
