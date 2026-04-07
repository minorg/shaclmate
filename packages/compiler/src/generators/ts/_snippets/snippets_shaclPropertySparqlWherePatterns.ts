import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_SparqlWherePatternsFunction } from "./snippets_SparqlWherePatternsFunction.js";

export const snippets_shaclPropertySparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertySparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}shaclPropertySparqlWherePatterns<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, preferredLanguages, propertyName, propertySchema, typeSparqlWherePatterns, variablePrefix }: {
  filter?: FilterT;
  focusIdentifier: ${imports.NamedNode} | ${imports.Variable},
  ignoreRdfType?: boolean;
  preferredLanguages?: readonly string[];
  propertySchema: ${snippets_ShaclPropertySchema}<TypeSchemaT>;
  propertyName: string;
  typeSparqlWherePatterns: ${snippets_SparqlWherePatternsFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${snippets_SparqlPattern}[] {
  if (propertyShema.path.termType !== "NamedNode") {
    throw new Error("non-predicate paths not supported in SPARQL");
  }

  const valueString = \`\${variablePrefix}\${propertyName[0].toUpperCase()}\${propertyName.slice(1)}\`;
  const valueVariable = ${imports.dataFactory}.variable!(valueString);

  const propertyPatterns: ${imports.sparqljs}.BgpPattern[] = [{
    triples: [{
      subject: focusIdentifier,
      predicate: propertySchema.path,
      object: valueVariable,
    }],
    type: "bgp"
  }];

  return typeSparqlWherePatterns({
    filter,
    ignoreRdfType,
    preferredLanguages,
    propertyPatterns,
    schema: propertySchema.type(),
    valueVariable,
    variablePrefix: valueString
  });
}`,
);
