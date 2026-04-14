import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";
import { snippets_SparqlConstructTriplesFunction } from "./snippets_SparqlConstructTriplesFunction.js";

export const snippets_shaclPropertySparqlConstructTriples = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertySparqlConstructTriples`,
  code`\
function ${syntheticNamePrefix}shaclPropertySparqlConstructTriples<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, propertyName, propertySchema, typeSparqlConstructTriples, variablePrefix }: {
  filter: FilterT | undefined;
  focusIdentifier: ${imports.NamedNode} | ${imports.Variable},
  ignoreRdfType: boolean;
  propertySchema: ${snippets_ShaclPropertySchema}<TypeSchemaT>;
  propertyName: string;
  typeSparqlConstructTriples: ${snippets_SparqlConstructTriplesFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${imports.sparqljs}.Triple[] {
  const propertyPathSparqlConstructTriples = ({ end, propertyPath, start, variableCounter }: {
    variableCounter: { value: number };
    end: ${imports.Literal} | ${imports.NamedNode} | ${imports.Variable};
    propertyPath: ${imports.PropertyPath};
    start: ${imports.NamedNode} | ${imports.Variable};
  }): readonly ${imports.sparqljs}.Triple[] => {
    switch (propertyPath.termType) {
      case "AlternativePath": {
        return propertyPath.members.flatMap((member) =>
          propertyPathSparqlConstructTriples({ end, propertyPath: member, start, variableCounter }),
        );
      }

      case "InversePath": {
        if (end.termType === "Literal") {
          throw new Error(\`invalid term type for inverse path: \${end.termType}\`);
        }

        return propertyPathSparqlConstructTriples({
          end: start,
          propertyPath: propertyPath.path,
          start: end,
          variableCounter,
        });
      }

      case "NamedNode": {
        return [{ subject: start, predicate: propertyPath as NamedNode, object: end }];
      }

      case "SequencePath": {
        if (propertyPath.members.length === 0) {
          return [];
        }

        if (propertyPath.members.length === 1) {
          return propertyPathSparqlConstructTriples({ end, propertyPath: propertyPath.members[0], start, variableCounter });
        }

        let triples: ${imports.sparqljs}.Triple[] = [];
        let current: ${imports.NamedNode} | ${imports.Variable} = start;
        for (let memberI = 0; memberI < propertyPath.members.length; memberI++) {
          const next: ${imports.NamedNode} | ${imports.Literal} | ${imports.Variable} = memberI === propertyPath.members.length - 1
            ? end
            : ${imports.dataFactory}.variable(\`\${variablePrefix}\${variableCounter.value++}\`);
          triples = triples.concat(propertyPathSparqlConstructTriples({ end: next, propertyPath: propertyPath.members[memberI], start: current, variableCounter }));
          current = next as ${imports.NamedNode} | ${imports.Variable};
        }

        return triples;
      }

      case "OneOrMorePath":
      case "ZeroOrMorePath":
      case "ZeroOrOnePath": {
        throw new Error(\`\${propertyName}: \${propertyPath.termType} property path cannot be represented as SPARQL CONSTRUCT triples\`);
      }

      default: {
        propertyPath satisfies never;
        throw new Error(\`\${propertyName}: unhandled property path termType: \${(propertyPath as any).termType}\`);
      }
    }
  }

  const valueString = \`\${variablePrefix}\${propertyName[0].toUpperCase()}\${propertyName.slice(1)}\`;
  const valueVariable = ${imports.dataFactory}.variable!(valueString);

  const variableCounter = { value: 0 };
  return propertyPathSparqlConstructTriples({ end: valueVariable, propertyPath: propertySchema.path, start: focusIdentifier, variableCounter })
    .concat(typeSparqlConstructTriples({
      filter,
      ignoreRdfType,
      schema: propertySchema.type(),
      valueVariable,
      variablePrefix: valueString
    }));
}`,
);
