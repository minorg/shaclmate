import type { SnippetFactory } from "../SnippetFactory.js";
import { code, conditionalOutput } from "../ts-poet-wrapper.js";

export const snippets_shaclPropertySparqlWherePatterns: SnippetFactory = ({
  imports,
  snippets,
  syntheticNamePrefix,
}) =>
  conditionalOutput(
    `${syntheticNamePrefix}shaclPropertySparqlWherePatterns`,
    code`\
function ${syntheticNamePrefix}shaclPropertySparqlWherePatterns<FilterT, TypeSchemaT>({ filter, focusIdentifier, ignoreRdfType, preferredLanguages, propertyName, propertySchema, typeSparqlWherePatterns, variablePrefix }: {
  filter: FilterT | undefined;
  focusIdentifier: ${this.imports.NamedNode} | ${this.imports.Variable},
  ignoreRdfType: boolean;
  preferredLanguages: readonly string[] | undefined;
  propertySchema: ${this.snippets.ShaclPropertySchema}<TypeSchemaT>;
  propertyName: string;
  typeSparqlWherePatterns: ${this.snippets.ValueSparqlWherePatternsFunction}<FilterT, TypeSchemaT>;
  variablePrefix: string;
}): readonly ${this.snippets.SparqlPattern}[] {
  const propertyPathSparqlWherePatterns = ({ end, propertyPath, start, variableCounter }: {
    end: ${this.imports.Literal} | ${this.imports.NamedNode} | ${this.imports.Variable};
    propertyPath: ${this.snippets.PropertyPath};
    start: ${this.imports.NamedNode} | ${this.imports.Variable};
    variableCounter: { value: number };
  }): ${this.snippets.SparqlPattern}[] => {
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
          triples: [{ subject: start, predicate: ${this.snippets.sparqlPropertyPath}(propertyPath), object: end }],
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

        let patterns: ${this.snippets.SparqlPattern}[] = [];
        let current: ${this.imports.NamedNode} | ${this.imports.Variable} = start;
        for (let memberI = 0; memberI < propertyPath.members.length; memberI++) {
          const next: ${this.imports.NamedNode} | ${this.imports.Literal} | ${this.imports.Variable} = memberI === propertyPath.members.length - 1
            ? end
            : ${this.imports.dataFactory}.variable(\`\${variablePrefix}\${variableCounter.value++}\`);
          patterns = patterns.concat(propertyPathSparqlWherePatterns({ end: next, propertyPath: propertyPath.members[memberI], start: current, variableCounter }));
          current = next as ${this.imports.NamedNode} | ${this.imports.Variable};
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
  const valueVariable = ${this.imports.dataFactory}.variable!(valueString);

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
