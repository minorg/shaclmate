import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_listSparqlConstructTriples: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}listSparqlConstructTriples`,
    code`\
function ${syntheticNamePrefix}listSparqlConstructTriples<ItemFilterT, ItemSchemaT>(itemSparqlConstructTriplesFunction: ${snippets.ValueSparqlConstructTriplesFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlConstructTriplesFunction}<${snippets.CollectionFilter}<ItemFilterT>, ${snippets.CollectionSchema}<ItemSchemaT>> {
  return ({ filter, schema, valueVariable: listVariable, variablePrefix: variablePrefixPrefix }) => {
    let triples: ${imports.sparqljs}.Triple[] = [];
    const variable = (suffix: string) => ${imports.dataFactory}.variable!(\`\${variablePrefixPrefix}\${suffix}\`);
    const variablePrefix = (suffix: string) => \`\${variablePrefixPrefix}\${suffix}\`;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      triples.push({ subject: listVariable, predicate: ${snippets.RdfVocabularies}.rdf.first, object: item0Variable });
      triples = triples.concat(itemSparqlConstructTriplesFunction({ filter, ignoreRdfType: false, schema: schema.itemType, valueVariable: item0Variable, variablePrefix: variablePrefix("Item0") }));
    }

    {
      // ?list rdf:rest ?rest0
      triples.push({ subject: listVariable, predicate: ${snippets.RdfVocabularies}.rdf.rest, object: variable("Rest0") });
    }

    // Don't do ?list rdf:rest+ ?restN in CONSTRUCT
    const restNVariable = variable("RestN");

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      triples.push({ subject: restNVariable, predicate: ${snippets.RdfVocabularies}.rdf.first, object: itemNVariable });
      triples = triples.concat(itemSparqlConstructTriplesFunction({ filter, ignoreRdfType: false, schema: schema.itemType, valueVariable: itemNVariable, variablePrefix: variablePrefix("ItemN") }));
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    triples.push({ subject: restNVariable, predicate: ${snippets.RdfVocabularies}.rdf.rest, object: variable("RestNBasic") });

    return triples;
  }
}`,
  );
