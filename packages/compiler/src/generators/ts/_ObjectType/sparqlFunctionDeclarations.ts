import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { camelCase } from "change-case";
import { type Code, code, conditionalOutput, joinCode } from "ts-poet";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { sharedSnippets } from "../sharedSnippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { sparqlConstructQueryFunctionDeclaration } from "./sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "./sparqlConstructQueryStringFunctionDeclaration.js";

namespace localSnippets {
  export const sparqlInstancesOfPattern = conditionalOutput(
    `${syntheticNamePrefix}sparqlInstancesOfPattern`,
    code`\
/**
 * A sparqljs.Pattern that's the equivalent of ?subject rdf:type/rdfs:subClassOf* ?rdfType .
 */
function ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType, subject }: { rdfType: ${imports.NamedNode} | ${imports.Variable}, subject: ${imports.sparqljs}.Triple["subject"] }): ${imports.sparqljs}.BgpPattern {
  return {
    triples: [
      {
        subject,
        predicate: {
          items: [
            ${sharedSnippets.RdfVocabularies}.rdf.type,
            {
              items: [${sharedSnippets.RdfVocabularies}.rdfs.subClassOf],
              pathType: "*",
              type: "path",
            },
          ],
          pathType: "/",
          type: "path",
        },
        object: rdfType,
      },
    ],
    type: "bgp",
  };
}`,
  );
}

export function sparqlFunctionDeclarations(this: ObjectType): readonly Code[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  const subjectDefault = camelCase(this.name);

  const variables = {
    filter: code`parameters?.filter`,
    preferredLanguages: code`parameters?.preferredLanguages`,
    focusIdentifier: code`subject`,
    variablePrefix: code`(parameters?.variablePrefix ?? (subject.termType === "Variable" ? subject.value : "${subjectDefault}"))`,
  };
  const rdfClassVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let patternsVariableDeclarationKeyword = "const";
  let triplesVariableDeclarationKeyword = "const";
  const sparqlConstructTriplesStatements: Code[] = [];
  const sparqlWherePatternsStatements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    sparqlConstructTriplesStatements.push(
      code`triples = triples.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{ ignoreRdfType: true, subject: variables.focusIdentifier, variablePrefix: variables.variablePrefix }}));`,
    );
    triplesVariableDeclarationKeyword = "let";
    sparqlWherePatternsStatements.push(code`\
patterns = patterns.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${{ filter: variables.filter, ignoreRdfType: true, subject: variables.focusIdentifier, variablePrefix: variables.variablePrefix }}));`);
    patternsVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    const fromRdfTypeVariables = this.fromRdfTypeVariable
      .toList()
      .concat(this.descendantFromRdfTypeVariables);

    sparqlConstructTriplesStatements.push(code`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject, predicate: ${rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
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
        ? `\
    {
      type: "values" as const,
      values: [${fromRdfTypeVariables.join(", ")}].map((identifier) => {
        const valuePatternRow: ${imports.sparqljs}.ValuePatternRow = {};
        valuePatternRow[\`?\${${variables.variablePrefix}}FromRdfType\`] = identifier as ${imports.NamedNode};
        return valuePatternRow;
      }),
    },
    ${localSnippets.sparqlInstancesOfPattern}({ rdfType: ${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}FromRdfType\`), subject }),`
        : `${localSnippets.sparqlInstancesOfPattern}({ rdfType: ${fromRdfTypeVariables[0]}, subject }),`
    }
    {
      triples: [
        {
          subject,
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
      .sparqlConstructTriples({
        variables,
      })
      .ifJust((propertyTriples) => {
        sparqlConstructTriplesStatements.push(
          code`triples = triples.concat(${propertyTriples});`,
        );
        triplesVariableDeclarationKeyword = "let";
      });

    property
      .sparqlWherePatterns({ variables })
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
    sparqlConstructQueryFunctionDeclaration.bind(this)(),
    sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    code`\
export function ${syntheticNamePrefix}sparqlConstructTriples(${sparqlConstructTriplesStatements.length === 0 ? "_" : ""}parameters?: { ignoreRdfType?: boolean; subject?: ${imports.sparqljs}.Triple["subject"], variablePrefix?: string }): readonly ${imports}.Triple[] {
${
  sparqlConstructTriplesStatements.length > 0
    ? joinCode([
        code`const subject = parameters?.subject ?? ${imports.dataFactory}.variable!("${subjectDefault}");`,
        code`${triplesVariableDeclarationKeyword} triples: ${imports.sparqljs}.Triple[] = []`,
        ...sparqlConstructTriplesStatements,
        code`return triples;`,
      ])
    : "return [];"
}
}`,
    code`\
export function ${syntheticNamePrefix}sparqlWherePatterns(${sparqlWherePatternsStatements.length === 0 ? "_" : ""}parameters?: { filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: ${imports.sparqljs}.Triple["subject"], variablePrefix?: string }): readonly ${sharedSnippets.SparqlPattern}[] {
${
  sparqlWherePatternsStatements.length > 0
    ? joinCode([
        code`${patternsVariableDeclarationKeyword} patterns: ${sharedSnippets.SparqlPattern}[] = [];`,
        code`const subject = parameters?.subject ?? ${imports.dataFactory}.variable!("${subjectDefault}");`,
        ...sparqlWherePatternsStatements,
        code`return patterns;`,
      ])
    : "return [];"
}
}`,
  ];
}
