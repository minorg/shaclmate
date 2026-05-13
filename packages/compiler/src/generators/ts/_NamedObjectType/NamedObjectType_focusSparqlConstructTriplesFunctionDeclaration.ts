import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  focusIdentifier: code`parameters.focusIdentifier`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function NamedObjectType_focusSparqlConstructTriplesFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("sparql")) {
    return Maybe.empty();
  }

  const rdfClassVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${this.reusables.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let triplesVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      code`triples = triples.concat(${parentObjectType.name}.focusSparqlConstructTriples(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, variablePrefix: variables.variablePrefix }}));`,
    );
    triplesVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    statements.push(code`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject: ${variables.focusIdentifier}, predicate: ${this.rdfjsTermExpression(rdf.type)}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${this.rdfjsTermExpression(rdfs.subClassOf)}, object: ${rdfClassVariable} }
  );
}`);
  }

  for (const property of this.properties) {
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
export const focusSparqlConstructTriples: ${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}> = (${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${this.reusables.imports.sparqljs}.Triple[] = [];`,
        ...statements,
        code`return triples;`,
      ])
    : "return [];"
}
};`);
}
