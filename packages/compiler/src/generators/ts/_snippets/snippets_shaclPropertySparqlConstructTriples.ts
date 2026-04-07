import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";
import { snippets_SparqlConstructTriplesFunction } from "./snippets_SparqlConstructTriplesFunction.js";

export const snippets_shaclPropertySparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertySparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}shaclPropertySparqlConstructTriples<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, propertyName, propertySchema, typeSparqlConstructTriples, variablePrefix }: {
  filter?: FilterT;
  focusIdentifier: ${imports.NamedNode} | ${imports.Variable},
  ignoreRdfType?: boolean;
  propertySchema: ${snippets_ShaclPropertySchema}<TypeSchemaT>;
  propertyName: string;
  typeSparqlConstructTriples: ${snippets_SparqlConstructTriplesFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${imports.sparqljs}.Triple[] {
  if (propertySchema.path.termType !== "NamedNode") {
    throw new Error("non-predicate paths not supported in SPARQL");
  }

  const valueString = \`\${variablePrefix}\${propertyName[0].toUpperCase()}\${propertyName.slice(1)}\`;
  const valueVariable = ${imports.dataFactory}.variable!(valueString);

  return [{ subject: focusIdentifier, predicate: propertySchema.path, object: valueVariable } as ${imports.sparqljs}.Triple]
    .concat(typeSparqlConstructTriples({
      filter,
      ignoreRdfType,
      schema: propertySchema.type(),
      valueVariable,
      variablePrefix: valueString
    }));
}`,
);
