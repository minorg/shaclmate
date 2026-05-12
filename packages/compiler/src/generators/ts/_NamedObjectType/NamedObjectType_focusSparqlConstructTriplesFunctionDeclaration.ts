import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { imports } from "../this.imports.js";
import { snippets } from "../this.snippets.js";
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

  const rdfClassVariable = code`${this.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfClass\`)`;
  const rdfTypeVariable = code`${this.imports.dataFactory}.variable!(\`\${${variables.variablePrefix}}RdfType\`)`;

  let triplesVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

  for (const parentObjectType of this.parentObjectTypes) {
    statements.push(
      code`triples = triples.concat(${parentObjectType.name}.${syntheticNamePrefix}focusSparqlConstructTriples(${{ filter: variables.filter, focusIdentifier: variables.focusIdentifier, ignoreRdfType: true, variablePrefix: variables.variablePrefix }}));`,
    );
    triplesVariableDeclarationKeyword = "let";
  }

  if (this.fromRdfType.isJust()) {
    statements.push(code`\
if (!parameters?.ignoreRdfType) {
  triples.push(
    { subject: ${variables.focusIdentifier}, predicate: ${rdfjsTermExpression(rdf.type, { logger: this.logger })}, object: ${rdfTypeVariable} },
    { subject: ${rdfTypeVariable}, predicate: ${rdfjsTermExpression(rdfs.subClassOf, { logger: this.logger })}, object: ${rdfClassVariable} }
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
export const ${syntheticNamePrefix}focusSparqlConstructTriples: ${this.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}> = (${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${this.imports.sparqljs}.Triple[] = [];`,
        ...statements,
        code`return triples;`,
      ])
    : "return [];"
}
};`);
}
