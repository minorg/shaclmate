import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";
import { ObjectType_sparqlConstructQueryFunctionDeclaration } from "./ObjectType_sparqlConstructQueryFunctionDeclaration.js";
import { ObjectType_sparqlConstructQueryStringFunctionDeclaration } from "./ObjectType_sparqlConstructQueryStringFunctionDeclaration.js";

export function ObjectType_sparqlFunctionDeclarations(
  this: ObjectType,
): readonly Code[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  const variables = {
    filter: code`parameters.filter`,
    preferredLanguages: code`parameters.preferredLanguages`,
    focusIdentifier: code`parameters.focusIdentifier`,
    variablePrefix: code`parameters.variablePrefix`,
  };
  const rdfClassVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let patternsVariableDeclarationKeyword = "const";
  let triplesVariableDeclarationKeyword = "const";
  const sparqlConstructTriplesStatements: Code[] = [];
  const sparqlWherePatternsStatements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    sparqlConstructTriplesStatements.push(
      code`triples = triples.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{ focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, variablePrefix: variables.variablePrefix }}));`,
    );
    triplesVariableDeclarationKeyword = "let";
    sparqlWherePatternsStatements.push(code`\
patterns = patterns.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, variablePrefix: variables.variablePrefix }}));`);
    patternsVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    const fromRdfTypeVariables = this.fromRdfTypeVariable
      .toList()
      .concat(this.descendantFromRdfTypeVariables);

    sparqlConstructTriplesStatements.push(code`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject: focusIdentifier, predicate: ${rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }
  );
}`);
    sparqlWherePatternsStatements.push(
      code`const rdfTypeVariable = ${rdfTypeVariable};`,
      code`\
if (!parameters?.ignoreRdfType) {
  patterns.push(
    ${
      fromRdfTypeVariables.length > 1
        ? code`\
    {
      type: "values" as const,
      values: [${joinCode(fromRdfTypeVariables, { on: "," })}].map((identifier) => {
        const valuePatternRow: ${imports.sparqljs}.ValuePatternRow = {};
        valuePatternRow[\`?\${${variables.variablePrefix}}FromRdfType\`] = identifier as ${imports.NamedNode};
        return valuePatternRow;
      }),
    },
    ${snippets.sparqlInstancesOfPattern}({ rdfType: ${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}FromRdfType\`), subject: focusIdentifier }),`
        : code`${snippets.sparqlInstancesOfPattern}({ rdfType: ${fromRdfTypeVariables[0]}, subject: focusIdentifier }),`
    }
    {
      triples: [
        {
          subject: focusIdentifier,
          predicate: ${rdfjsTermExpression(rdf.type)},
          object: rdfTypeVariable
        }
      ],
      type: "bgp" as const
    },
    {
      patterns: [
        {
          triples: [
            {
              subject: rdfTypeVariable,
              predicate: {
                items: [${rdfjsTermExpression(rdfs.subClassOf)}],
                pathType: "+" as const,
                type: "path" as const
              },
              object: ${rdfClassVariable}
            }
          ],
          type: "bgp" as const
        }
      ],
      type: "optional" as const
    }
  );
}`,
    );
  }

  for (const property of this.ownProperties) {
    if (property.recursive) {
      continue;
    }

    property
      .sparqlConstructTriplesExpression({
        variables,
      })
      .ifJust((propertyTriples) => {
        sparqlConstructTriplesStatements.push(
          code`triples = triples.concat(${propertyTriples});`,
        );
        triplesVariableDeclarationKeyword = "let";
      });

    property
      .sparqlWherePatternsExpression({ variables })
      .ifJust(({ condition, patterns }) => {
        const concatStatement = code`patterns = patterns.concat(${patterns});`;
        if (condition) {
          sparqlWherePatternsStatements.push(
            code`if (${condition}) { ${concatStatement} }`,
          );
        } else {
          sparqlWherePatternsStatements.push(concatStatement);
        }
        patternsVariableDeclarationKeyword = "let";
      });
  }

  return [
    ObjectType_sparqlConstructQueryFunctionDeclaration.bind(this)(),
    ObjectType_sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    code`\
export function ${syntheticNamePrefix}sparqlConstructTriples(${sparqlConstructTriplesStatements.length === 0 ? "_" : ""}parameters: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean;  variablePrefix: string }): readonly ${imports.sparqljs}.Triple[] {
${
  sparqlConstructTriplesStatements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${imports.sparqljs}.Triple[] = [];`,
        ...sparqlConstructTriplesStatements,
        code`return triples;`,
      ])
    : "return [];"
}
}`,
    code`\
export function ${syntheticNamePrefix}sparqlWherePatterns(${sparqlWherePatternsStatements.length === 0 ? "_" : ""}parameters: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean; preferredLanguages: readonly string[] | undefined; variablePrefix: string }): readonly ${snippets.SparqlPattern}[] {
${
  sparqlWherePatternsStatements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${snippets.SparqlPattern}[] = [];`,
        ...sparqlWherePatternsStatements,
        code`return patterns;`,
      ])
    : "return [];"
}
}`,
  ];
}
