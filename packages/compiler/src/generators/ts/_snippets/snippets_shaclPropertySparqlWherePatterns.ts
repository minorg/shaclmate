import { imports } from "../imports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";
import { snippets_PropertyPath } from "./snippets_PropertyPath.js";
import { snippets_ShaclPropertySchema } from "./snippets_ShaclPropertySchema.js";
import { snippets_SparqlPattern } from "./snippets_SparqlPattern.js";
import { snippets_sparqlPropertyPath } from "./snippets_sparqlPropertyPath.js";
import { snippets_ValueSparqlWherePatternsFunction } from "./snippets_ValueSparqlWherePatternsFunction.js";

export const snippets_shaclPropertySparqlWherePatterns = conditionalOutput(
  `${syntheticNamePrefix}shaclPropertySparqlWherePatterns`,
  code`\
function ${syntheticNamePrefix}shaclPropertySparqlWherePatterns<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, preferredLanguages, propertyName, propertySchema, typeSparqlWherePatterns, variablePrefix }: {
  filter: FilterT | undefined;
  focusIdentifier: ${imports.NamedNode} | ${imports.Variable},
  ignoreRdfType: boolean;
  preferredLanguages: readonly string[] | undefined;
  propertySchema: ${snippets_ShaclPropertySchema}<TypeSchemaT>;
  propertyName: string;
  typeSparqlWherePatterns: ${snippets_ValueSparqlWherePatternsFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${snippets_SparqlPattern}[] {
  const propertyPathSparqlWherePatterns = ({ end, propertyPath, start, variableCounter }: {
    end: ${imports.Literal} | ${imports.NamedNode} | ${imports.Variable};
    propertyPath: ${snippets_PropertyPath};
    start: ${imports.NamedNode} | ${imports.Variable};
    variableCounter: { value: number };
  }): ${snippets_SparqlPattern}[] => {
    switch (propertyPath.termType) {
      case "AlternativePath": {
        return [{
          patterns: propertyPath.members.map((member) => ({
            patterns: propertyPathSparqlWherePatterns({ end, propertyPath: member, start, variableCounter }),
            type: "group" as const,
          })),
          type: "union",
        }];
      }

      case "InversePath":
      case "NamedNode":
      case "OneOrMorePath":
      case "ZeroOrMorePath":
      case "ZeroOrOnePath": {
        return [{
          triples: [{ subject: start, predicate: ${snippets_sparqlPropertyPath}(propertyPath), object: end }],
          type: "bgp"
        }];
      }

      case "SequencePath": {
        if (propertyPath.members.length === 0) {
          return [];
        }

        if (propertyPath.members.length === 1) {
          return propertyPathSparqlWherePatterns({ end, propertyPath: propertyPath.members[0], start, variableCounter });
        }

        let patterns: ${snippets_SparqlPattern}[] = [];
        let current: ${imports.NamedNode} | ${imports.Variable} = start;
        for (let memberI = 0; memberI < propertyPath.members.length; memberI++) {
          const next: ${imports.NamedNode} | ${imports.Literal} | ${imports.Variable} = memberI === propertyPath.members.length - 1
            ? end
            : ${imports.dataFactory}.variable(\`\${variablePrefix}\${variableCounter.value++}\`);
          patterns = patterns.concat(propertyPathSparqlWherePatterns({ end: next, propertyPath: propertyPath.members[memberI], start: current, variableCounter }));
          current = next as ${imports.NamedNode} | ${imports.Variable};
        }

        return patterns;
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
  const propertyPatterns = propertyPathSparqlWherePatterns({ end: valueVariable, propertyPath: propertySchema.path, start: focusIdentifier, variableCounter });

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
