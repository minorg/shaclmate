import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";

import { camelCase } from "change-case";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { sparqlConstructQueryFunctionDeclaration } from "./sparqlConstructQueryFunctionDeclaration.js";
import { sparqlConstructQueryStringFunctionDeclaration } from "./sparqlConstructQueryStringFunctionDeclaration.js";

export function sparqlFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("sparql")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  const variables = { subject: "subject", variablePrefix: "variablePrefix" };
  const rdfClassVariable = `${this.dataFactoryVariable}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = `${this.dataFactoryVariable}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  const subjectDefault = camelCase(this.name);
  const preambleStatements = [
    `const subject = parameters?.subject ?? ${this.dataFactoryVariable}.variable!("${subjectDefault}");`,
    `const variablePrefix = parameters?.variablePrefix ?? (subject.termType === "Variable" ? subject.value : "${subjectDefault}");`,
  ];

  const sparqlConstructTemplateTriples = [
    ...this.parentObjectTypes.map(
      (parentObjectType) =>
        `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples({ ignoreRdfType: true, subject, variablePrefix })`,
    ),
    ...(this.fromRdfType.isJust()
      ? [
          `...(parameters?.ignoreRdfType ? [] :
            [
              { subject, predicate: ${this.rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
              { subject: ${rdfTypeVariable}, predicate: ${this.rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} },
            ]
          )`,
        ]
      : []),
    ...this.ownProperties.flatMap((property) =>
      property.sparqlConstructTemplateTriples({ variables }),
    ),
  ];

  const sparqlWherePatterns = [
    ...this.parentObjectTypes.map(
      (parentObjectType) =>
        `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ ignoreRdfType: true, subject, variablePrefix })`,
    ),
    ...(this.fromRdfType.isJust()
      ? [
          `...(parameters?.ignoreRdfType ? [] : 
            [
              {
                triples: [
                  {
                    subject,
                    predicate: {
                      items: [
                        ${this.rdfjsTermExpression(rdf.type)},
                        {
                          items: [${this.rdfjsTermExpression(rdfs.subClassOf)}],
                          pathType: "*" as const,
                          type: "path" as const
                        },
                      ],
                      pathType: "/" as const,
                      type: "path" as const
                    },
                    object: ${this.rdfjsTermExpression(this.fromRdfType.unsafeCoerce())}
                  }
                ],
                type: "bgp" as const
              },
              {
                triples: [
                  {
                    subject,
                    predicate: ${this.rdfjsTermExpression(rdf.type)},
                    object: ${rdfTypeVariable}
                  }
                ],
                type: "bgp" as const
              },
              {
                patterns: [
                  {
                    triples: [
                      {
                        subject: ${rdfTypeVariable},
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
            ]
          )`,
        ]
      : []),
    ...this.ownProperties.flatMap((property) =>
      property.sparqlWherePatterns({ variables }),
    ),
  ];

  return [
    sparqlConstructQueryFunctionDeclaration.bind(this)(),
    sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlConstructTemplateTriples`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${sparqlConstructTemplateTriples.length === 0 ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Triple[]",
      statements: [
        ...(sparqlConstructTemplateTriples.length > 0
          ? preambleStatements
          : []),
        `return [${sparqlConstructTemplateTriples.join(", ")}];`,
      ],
    },
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlWherePatterns`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${sparqlWherePatterns.length === 0 ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Pattern[]",
      statements: [
        ...(sparqlWherePatterns.length > 0 ? preambleStatements : []),
        `return [${sparqlWherePatterns.join(", ")}];`,
      ],
    },
  ];
}
