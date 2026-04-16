import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  focusIdentifier: code`parameters.focusIdentifier`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function ObjectType_sparqlConstructTriplesFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  const rdfClassVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let triplesVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      code`triples = triples.concat(${parentObjectType.staticModuleName}.${syntheticNamePrefix}sparqlConstructTriples(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, variablePrefix: variables.variablePrefix }}));`,
    );
    triplesVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    statements.push(code`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject: ${variables.focusIdentifier}, predicate: ${rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }
  );
}`);
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
        statements.push(code`triples = triples.concat(${propertyTriples});`);
        triplesVariableDeclarationKeyword = "let";
      });
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}sparqlConstructTriples(${statements.length === 0 ? "_" : ""}parameters: { filter: ${this.filterType} | undefined; focusIdentifier: ${imports.NamedNode} | ${imports.Variable}; ignoreRdfType: boolean;  variablePrefix: string }): readonly ${imports.sparqljs}.Triple[] {
${
  statements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${imports.sparqljs}.Triple[] = [];`,
        ...statements,
        code`return triples;`,
      ])
    : "return [];"
}
}`);
}
