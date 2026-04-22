import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  preferredLanguages: code`parameters.preferredLanguages`,
  focusIdentifier: code`parameters.focusIdentifier`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function ObjectType_focusSparqlWherePatternsFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  const rdfClassVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let patternsVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(code`\
patterns = patterns.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}focusSparqlWherePatterns(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, preferredLanguages: variables.preferredLanguages, variablePrefix: variables.variablePrefix }}));`);
    patternsVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    const fromRdfTypeVariables = this.fromRdfTypeVariable
      .toList()
      .concat(this.descendantFromRdfTypeVariables);

    statements.push(
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
    ${snippets.sparqlInstancesOfPattern}({ rdfType: ${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}FromRdfType\`), subject: ${variables.focusIdentifier} }),`
        : code`${snippets.sparqlInstancesOfPattern}({ rdfType: ${fromRdfTypeVariables[0]}, subject: ${variables.focusIdentifier} }),`
    }
    {
      triples: [
        {
          subject: ${variables.focusIdentifier},
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
      .sparqlWherePatternsExpression({ variables })
      .ifJust(({ condition, patterns }) => {
        const concatStatement = code`patterns = patterns.concat(${patterns});`;
        if (condition) {
          statements.push(code`if (${condition}) { ${concatStatement} }`);
        } else {
          statements.push(concatStatement);
        }
        patternsVariableDeclarationKeyword = "let";
      });
  }

  return Maybe.of(code`\
export const ${syntheticNamePrefix}focusSparqlWherePatterns: ${snippets.FocusSparqlWherePatternsFunction}<${this.filterType}> = (${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${snippets.SparqlPattern}[] = [];`,
        ...statements,
        code`return patterns;`,
      ])
    : "return [];"
}
};`);
}
