import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";
import { snippets_SparqlConstructTriplesFunction } from "./snippets_SparqlConstructTriplesFunction.js";

export const snippets_shaclPropertySparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertySparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}shaclPropertySparqlConstructTriples<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, name, schema, typeSparqlConstructTriples, variablePrefix }: {
  filter?: FilterT;
  focusIdentifier: ${imports.Resource}.Identifier,
  ignoreRdfType?: boolean;
  schema: ${snippets_ShaclPropertySchema}<TypeSchemaT>;
  name: string;
  typeSparqlConstructTriples: ${snippets_SparqlConstructTriplesFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${imports.sparqljs}.Triple[] {
  const valueString = \`\${variablePrefix}\${propertyName[0].toUpperCase()}\${propertyName.slice(1)}\`;
  const valueVariable = ${imports.dataFactory}.variable!(valueString);

  return [{ subject: focusIdentifier, predicate: schema.identifier, object: valueVariable } as ${imports.sparqljs}.Triple]
    .concat(typeSparqlConstructTriples({
      filter,
      ignoreRdfType,
      schema: propertySchema.type(),
      valueVariable,
      variablePrefix: valueString
    }));
}`,
);
