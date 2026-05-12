import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_setSparqlConstructTriples: SnippetFactory = ({
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}setSparqlConstructTriples`,
    code`\
function ${syntheticNamePrefix}setSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${this.snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${this.snippets.ValueSparqlConstructTriplesFunction}<${this.snippets.CollectionFilter}<ItemFilterT>, ${this.snippets.CollectionSchema}<ItemSchemaT>> {
  return ({ schema, ...otherParameters }) => itemSparqlConstructTriplesFunction({ ...otherParameters, schema: schema.item() });
}`,
  );
