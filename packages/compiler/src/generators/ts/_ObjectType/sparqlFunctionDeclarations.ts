import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { camelCase } from "change-case";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { objectInitializer } from "../objectInitializer.js";
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

  const subjectDefault = camelCase(this.name);

  const variables = {
    filter: "parameters?.filter",
    preferredLanguages: "parameters?.preferredLanguages",
    focusIdentifier: "subject",
    variablePrefix: `(parameters?.variablePrefix ?? (subject.termType === "Variable" ? subject.value : "${subjectDefault}"))`,
  };
  const rdfClassVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = `dataFactory.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  const sparqlConstructTriplesStatements = [];
  const sparqlWherePatternsStatements = [];

  for (const parentObjectType of this.parentObjectTypes) {
    sparqlConstructTriplesStatements.push(
      `triples.push(...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${objectInitializer({ ignoreRdfType: true, subject: variables.focusIdentifier, variablePrefix: variables.variablePrefix })}));`,
    );
    sparqlWherePatternsStatements.push(`\
patterns.push(...${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlWherePatterns(${objectInitializer({ filter: variables.filter, ignoreRdfType: true, subject: variables.focusIdentifier, variablePrefix: variables.variablePrefix })}));`);
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
  patterns.push(
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

    for (const triple of property.sparqlConstructTriples({
      variables,
    })) {
      sparqlConstructTriplesStatements.push(
        `triples.push(${typeof triple === "object" ? objectInitializer(triple as unknown as Record<string, string>) : triple});`,
      );
    }

    const { condition, patterns } = property.sparqlWherePatterns({ variables });
    if (patterns.length > 0) {
      const pushStatement = `patterns.push(${patterns});`;
      if (condition) {
        sparqlWherePatternsStatements.push(
          `if (${condition}) { ${pushStatement} }`,
        );
      } else {
        sparqlWherePatternsStatements.push(pushStatement);
      }
    }
  }

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
          name: `${sparqlConstructTriplesStatements.length === 0 ? "_" : ""}parameters`,
          type: '{ ignoreRdfType?: boolean; subject?: sparqljs.Triple["subject"], variablePrefix?: string }',
        },
      ],
      returnType: "readonly sparqljs.Triple[]",
      statements:
        sparqlConstructTriplesStatements.length > 0
          ? [
              `const subject = parameters?.subject ?? dataFactory.variable!("${subjectDefault}");`,
              "const triples: sparqljs.Triple[] = []",
              ...sparqlConstructTriplesStatements,
              "return triples;",
            ]
          : ["return [];"],
    },
    {
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}sparqlWherePatterns`,
      parameters: [
        {
          hasQuestionToken: true,
          name: `${sparqlWherePatternsStatements.length === 0 ? "_" : ""}parameters`,
          type: `{ filter?: ${this.filterType}; ignoreRdfType?: boolean; preferredLanguages?: readonly string[]; subject?: sparqljs.Triple["subject"], variablePrefix?: string }`,
        },
      ],
      returnType: "readonly sparqljs.Pattern[]",
      statements:
        sparqlWherePatternsStatements.length > 0
          ? [
              "const patterns: sparqljs.Pattern[] = [];",
              `const subject = parameters?.subject ?? dataFactory.variable!("${subjectDefault}");`,
              ...sparqlWherePatternsStatements,
              "return patterns;",
            ]
          : ["return [];"],
    },
  ];
}
