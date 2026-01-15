import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { camelCase } from "change-case";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
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

  const variables = {
    filter: "parameters?.filter",
    preferredLanguages: "parameters?.preferredLanguages",
    focusIdentifier: "subject",
    variablePrefix: "variablePrefix",
  };
  const rdfClassVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  const subjectDefault = camelCase(this.name);

  const sparqlConstructTriplesStatements = [
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
    sparqlConstructTriplesStatements.push(
      `triples.push(...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples({ ignoreRdfType: true, subject, variablePrefix }));`,
    );
    sparqlWherePatternsStatements.push(`\
for (const pattern of ${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns({ filter: parameters?.filter, ignoreRdfType: true, subject, variablePrefix })) {
  if (pattern.type === "optional") {
    optionalPatterns.push(pattern);
  } else {
    requiredPatterns.push(pattern);
  }
}`);
    nop = false;
  }

  if (this.fromRdfType.isJust()) {
    const fromRdfTypeVariables = this.fromRdfTypeVariable
      .toList()
      .concat(this.descendantFromRdfTypeVariables);

    sparqlConstructTriplesStatements.push(`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject, predicate: ${rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }
  );
}`);
    sparqlWherePatternsStatements.push(
      `const rdfTypeVariable = ${rdfTypeVariable};`,
      `\
if (!parameters?.ignoreRdfType) {
  requiredPatterns.push(
    ${
      fromRdfTypeVariables.length > 1
        ? `\
    {
      type: "values" as const,
      values: [${fromRdfTypeVariables.join(", ")}].map((identifier) => {
        const valuePatternRow: sparqljs.ValuePatternRow = {};
        valuePatternRow[\`?\${${variables.variablePrefix}}FromRdfType\`] = identifier as rdfjs.NamedNode;
        return valuePatternRow;
      }),
    },
    ${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType: dataFactory.variable!(\`\${${variables.variablePrefix}}FromRdfType\`), subject }),`
        : `${syntheticNamePrefix}sparqlInstancesOfPattern({ rdfType: ${fromRdfTypeVariables[0]}, subject }),`
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
    }
  );
  optionalPatterns.push({
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
  });
}`,
    );
    nop = false;
  }

  const propertySparqlWherePatterns: string[] = [];
  for (const property of this.ownProperties) {
    if (property.recursive) {
      continue;
    }

    for (const triple of property.sparqlConstructTriples({
      variables,
    })) {
      sparqlConstructTriplesStatements.push(`triples.push(${triple});`);
      nop = false;
    }
    propertySparqlWherePatterns.push(
      ...property.sparqlWherePatterns({
        variables,
      }),
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

  sparqlConstructTriplesStatements.push("return triples;");
  sparqlWherePatternsStatements.push(
    "return requiredPatterns.concat(optionalPatterns);",
  );

  return [
    sparqlConstructQueryFunctionDeclaration.bind(this)(),
    sparqlConstructQueryStringFunctionDeclaration.bind(this)(),
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlConstructTriples`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${nop ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Triple[]",
      statements: nop ? "return [];" : sparqlConstructTriplesStatements,
    },
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlWherePatterns`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${nop ? "_" : ""}parameters`,
          type: `{ filter?: ${this.filterType.name}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"], variablePrefix?: string }`,
        },
      ],
      returnType: "readonly sparqljs.Pattern[]",
      statements: nop ? "return [];" : sparqlWherePatternsStatements,
    },
  ];
}
