import { rdf } from "@tpluscode/rdf-ns-builders";
import { dummyLogger } from "ts-log";
import { imports } from "../imports.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_CollectionFilter } from "./snippets_CollectionFilter.js";
import { snippets_CollectionSchema } from "./snippets_CollectionSchema.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

const logger = dummyLogger;

export const snippets_listSparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}listSparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}listSparqlWherePatterns<ItemFilterT, ItemSchemaT>(itemSparqlWherePatternsFunction: ${snippets.ValueSparqlWherePatternsFunction}<ItemFilterT, ItemSchemaT>): ${snippets.ValueSparqlWherePatternsFunction}<${snippets.CollectionFilter}<ItemFilterT>, ${snippets.CollectionSchema}<ItemSchemaT>> {
  return (parameters) => {
    // Need to handle two cases:
    // (1) (?s, ?p, ?list) where ?list binds to rdf:nil
    // (2) (?s, ?p, ?list) (?list, rdf:first, "element") (?list, rdf:rest, rdf:nil) etc. where list binds to the head of a list
    // Case (2) is case (1) with OPTIONAL graph patterns to handle actual list elements.

    const listVariable = parameters.valueVariable;
    const patterns: ${snippets.SparqlPattern}[] = [];
    const variable = (suffix: string) => ${imports.dataFactory}.variable!(\`\${parameters.variablePrefix}\${suffix}\`);
    const variablePrefix = (suffix: string) => \`\${parameters.variablePrefix}\${suffix}\`;

    {
      // ?list rdf:first ?item0
      const item0Variable = variable("Item0");
      patterns.push(
        {
          triples: [
            {
              subject: listVariable,
              predicate: ${rdfjsTermExpression(rdf.first, { logger })},
              object: item0Variable,
            },
          ],
          type: "bgp",
        },
        ...itemSparqlWherePatternsFunction({
          filter: parameters.filter,
          ignoreRdfType: parameters.ignoreRdfType,
          preferredLanguages: parameters.preferredLanguages,
          propertyPatterns: [],
          schema: parameters.schema.item(),
          valueVariable: item0Variable,
          variablePrefix: variablePrefix("Item0"),
        }),
      );
    }

    {
      // ?list rdf:rest ?rest0
      const rest0Variable = variable("Rest0");
      patterns.push({
        triples: [
          {
            subject: listVariable,
            predicate: ${rdfjsTermExpression(rdf.rest, { logger })},
            object: rest0Variable,
          },
        ],
        type: "bgp",
      });
    }

    const optionalPatterns: ${snippets.SparqlPattern}[] = [];
    
    const restNVariable = variable("RestN");
    // ?list rdf:rest+ ?restN
    optionalPatterns.push({
      type: "bgp",
      triples: [
        {
          subject: listVariable,
          predicate: { type: "path", pathType: "*", items: [${rdfjsTermExpression(rdf.rest, { logger })}] },
          object: restNVariable,
        },
      ],
    });

    {
      // ?rest rdf:first ?itemN
      const itemNVariable = variable("ItemN");
      optionalPatterns.push(
        {
          triples: [
            {
              subject: restNVariable,
              predicate: ${rdfjsTermExpression(rdf.first, { logger })},
              object: itemNVariable,
            },
          ],
          type: "bgp"
        },
        ...itemSparqlWherePatternsFunction({
          filter: parameters.filter,
          ignoreRdfType: parameters.ignoreRdfType,
          preferredLanguages: parameters.preferredLanguages,
          propertyPatterns: [],
          schema: parameters.schema.item(),
          valueVariable: itemNVariable,
          variablePrefix: variablePrefix("ItemN"),
        }),
      );
    }

    // ?restN rdf:rest ?restNBasic to get the rdf:rest statement in the CONSTRUCT
    optionalPatterns.push({
      triples: [
        {
          subject: restNVariable,
          predicate: ${rdfjsTermExpression(rdf.rest, { logger })},
          object: variable("RestNBasic"),
        },
      ],
      type: "bgp"
    });

    patterns.push({ type: "optional", patterns: optionalPatterns });

    // Having an optional around everything handles the rdf:nil case
    return [...parameters.propertyPatterns, { patterns, type: "optional" }];
  }
}`,
);
