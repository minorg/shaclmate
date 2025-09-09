import { camelCase } from "change-case";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
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
  const rdfClassVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  const subjectDefault = camelCase(this.name);

  const sparqlConstructTemplateTriplesStatements = [
    `const subject = parameters?.subject ?? dataFactory.variable!("${subjectDefault}");`,
    "const triples: sparqljs.Triple[] = []",
    `const variablePrefix = parameters?.variablePrefix ?? (subject.termType === "Variable" ? subject.value : "${subjectDefault}");`,
  ];
  let nop = true;

  const sparqlWherePatternsStatements = [
    "const optionalPatterns: sparqljs.OptionalPattern[] = [];",
    "const requiredPatterns: sparqljs.Pattern[] = [];",
    `const subject = parameters?.subject ?? dataFactory.variable!("${subjectDefault}");`,
    `const variablePrefix = parameters?.variablePrefix ?? (subject.termType === "Variable" ? subject.value : "${subjectDefault}");`,
  ];

  for (const parentObjectType of this.parentObjectTypes) {
    sparqlConstructTemplateTriplesStatements.push(
      `triples.push(...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTemplateTriples({ ignoreRdfType: true, subject, variablePrefix }));`,
    );
    sparqlWherePatternsStatements.push(`\
for (const pattern of ${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ ignoreRdfType: true, subject, variablePrefix })) {
  if (pattern.type === "optional") {
    optionalPatterns.push(pattern);
  } else {
    requiredPatterns.push(pattern);
  }
}`);
    nop = false;
  }

  if (this.fromRdfType.isJust()) {
    sparqlConstructTemplateTriplesStatements.push(`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject, predicate: ${rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }
  );
}`);
    sparqlWherePatternsStatements.push(`\
if (!parameters?.ignoreRdfType) {
  requiredPatterns.push(${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType: ${syntheticNamePrefix}fromRdfType, subject }));
  requiredPatterns.push({
    triples: [
      {
        subject,
        predicate: ${rdfjsTermExpression(rdf.type)},
        object: ${rdfTypeVariable}
      }
    ],
    type: "bgp" as const
  });
  optionalPatterns.push({
    patterns: [
      {
        triples: [
          {
            subject: ${rdfTypeVariable},
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
  });
}`);
    nop = false;
  }

  const propertySparqlWherePatterns: string[] = [];
  for (const property of this.ownProperties) {
    if (property.recursive) {
      continue;
    }

    for (const triple of property.sparqlConstructTemplateTriples({
      variables,
    })) {
      sparqlConstructTemplateTriplesStatements.push(`triples.push(${triple});`);
      nop = false;
    }
    propertySparqlWherePatterns.push(
      ...property.sparqlWherePatterns({ variables }),
    );
  }
  if (propertySparqlWherePatterns.length > 0) {
    sparqlWherePatternsStatements.push(`\
const propertyPatterns: readonly sparqljs.Pattern[] = [${propertySparqlWherePatterns.join(", ")}];
for (const pattern of propertyPatterns) {
  if (pattern.type === "optional") {
    optionalPatterns.push(pattern);
  } else {
    requiredPatterns.push(pattern);
  }  
}`);
    nop = false;
  }

  sparqlConstructTemplateTriplesStatements.push("return triples;");
  sparqlWherePatternsStatements.push(
    "return requiredPatterns.concat(optionalPatterns);",
  );

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
          name: `${nop ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Triple[]",
      statements: nop ? "return [];" : sparqlConstructTemplateTriplesStatements,
    },
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlWherePatterns`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${nop ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Pattern[]",
      statements: nop ? "return [];" : sparqlWherePatternsStatements,
    },
  ];
}
