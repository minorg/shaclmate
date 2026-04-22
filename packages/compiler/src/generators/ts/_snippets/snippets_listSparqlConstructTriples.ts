import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_RdfVocabularies } from "./snippets_RdfVocabularies.js";
import { snippets_ValueSparqlConstructTriplesFunction } from "./snippets_ValueSparqlConstructTriplesFunction.js";

export const snippets_listSparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}listSparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}listSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets_ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets_ValueSparqlConstructTriplesFunction}<${snippets_CollectionFilter}<ItemFilterT>, ${snippets_CollectionSchema}<ItemSchemaT>> {
  return ({ filter, schema, valueVariable: listVariable, variablePrefix: variablePrefixPrefix }) => {
    let triples: ${imports.sparqljs}.Triple[] = [];
    const variable = (suffix: string) => ${imports.dataFactory}.variable!(\`\${variablePrefixPrefix}\${suffix}\`);
    const variablePrefix = (suffix: string) => \`\${variablePrefixPrefix}\${suffix}\`;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      triples.push({ subject: listVariable, predicate: ${snippets_RdfVocabularies}.rdf.first, object: item0Variable });
      triples = triples.concat(itemSparqlConstructTriplesFunction({ filter, ignoreRdfType: false, schema: schema.item(), valueVariable: item0Variable, variablePrefix: variablePrefix("Item0") }));
    }

    {
      // ?list rdf:rest ?rest0
      triples.push({ subject: listVariable, predicate: ${snippets_RdfVocabularies}.rdf.rest, object: variable("Rest0") });
    }

    // Don't do ?list rdf:rest+ ?restN in CONSTRUCT
    const restNVariable = variable("RestN");

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      triples.push({ subject: restNVariable, predicate: ${snippets_RdfVocabularies}.rdf.first, object: itemNVariable });
      triples = triples.concat(itemSparqlConstructTriplesFunction({ filter, ignoreRdfType: false, schema: schema.item(), valueVariable: itemNVariable, variablePrefix: variablePrefix("ItemN") }));
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    triples.push({ subject: restNVariable, predicate: ${snippets_RdfVocabularies}.rdf.rest, object: variable("RestNBasic") });

    return triples;
  }
}`,
);
