import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  preferredLanguages: code`parameters.preferredLanguages`,
  focusIdentifier: code`parameters.focusIdentifier`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function NamedObjectType_focusSparqlWherePatternsFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("sparql")) {
    return Maybe.empty();
  }

  const rdfClassVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let patternsVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(code`\
patterns = patterns.concat(${parentObjectType.name}.focusSparqlWherePatterns(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, preferredLanguages: variables.preferredLanguages, variablePrefix: variables.variablePrefix }}));`);
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
        const valuePatternRow: ${this.reusables.imports.sparqljs}.ValuePatternRow = {};
        valuePatternRow[\`?\${${variables.variablePrefix}}FromRdfType\`] = identifier as ${this.reusables.imports.NamedNode};
        return valuePatternRow;
      }),
    },
    ${this.reusables.snippets.sparqlInstancesOfPattern}({ rdfType: ${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}FromRdfType\`), subject: ${variables.focusIdentifier} }),`
        : code`${this.reusables.snippets.sparqlInstancesOfPattern}({ rdfType: ${fromRdfTypeVariables[0]}, subject: ${variables.focusIdentifier} }),`
    }
    {
      triples: [
        {
          subject: ${variables.focusIdentifier},
          predicate: ${this.rdfjsTermExpression(rdf.type)},
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
                items: [${this.rdfjsTermExpression(rdfs.subClassOf)}],
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

  for (const property of this.properties) {
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
export const focusSparqlWherePatterns: ${this.reusables.snippets.FocusSparqlWherePatternsFunction}<${this.filterType}> = (${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
        ...statements,
        code`return patterns;`,
      ])
    : "return [];"
}
};`);
}
