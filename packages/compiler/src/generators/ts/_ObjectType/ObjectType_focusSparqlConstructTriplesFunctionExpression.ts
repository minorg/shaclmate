import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  focusIdentifier: code`parameters.focusIdentifier`,
  ignoreRdfType: code`parameters.ignoreRdfType`,
  variablePrefix: code`parameters.variablePrefix`,
};

export function ObjectType_focusSparqlConstructTriplesFunctionExpression(
  this: ObjectType,
): Code {
  let triplesVariableDeclarationKeyword = "const";
  const statements: Code[] = [];

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

  return code`\
((${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${this.reusables.imports.sparqljs}.Triple[] = [];`,
        ...statements,
        code`return triples;`,
      ])
    : "return [];"
}
})`;
}
