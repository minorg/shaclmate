import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  preferredLanguages: code`parameters.preferredLanguages`,
  focusIdentifier: code`parameters.focusIdentifier`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function ObjectType_focusSparqlWherePatternsFunctionExpression(
  this: ObjectType,
): Code {
  const rdfClassVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let patternsVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  this.fromRdfTypeVariable.ifJust((fromRdfTypeVariable) => {
    statements.push(
      code`const rdfTypeVariable = ${rdfTypeVariable};`,
      code`\
if (!parameters?.ignoreRdfType) {
  patterns.push(
    ${code`${this.reusables.snippets.sparqlInstancesOfPattern}({ rdfType: ${fromRdfTypeVariable}, subject: ${variables.focusIdentifier} }),`}
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
  });

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

  return code`\
((${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${this.reusables.snippets.SparqlPattern}[] = [];`,
        ...statements,
        code`return patterns;`,
      ])
    : "return [];"
}
})`;
}
