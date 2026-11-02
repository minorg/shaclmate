import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  filter: code`parameters.filter`,
  focusIdentifier: code`parameters.focusIdentifier`,
  ignoreRdfType: code`parameters.ignoreRdfType`,
  variablePrefix: code`parameters.variablePrefix`,
};

function ObjectType_focusSparqlConstructTriplesFunctionExpression(
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
(${statements.length === 0 ? "_" : ""}parameters) => {
${
  statements.length > 0
    ? joinCode([
        code`${triplesVariableDeclarationKeyword} triples: ${this.reusables.imports.sparqljs}.Triple[] = [];`,
        ...statements,
        code`return triples;`,
      ])
    : "return [];"
}
}`;
}

export function ObjectType_focusSparqlConstructTriplesFunction(
  this: ObjectType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FocusSparqlConstructTriplesFunction}<${this.filterType}>`,
    unannotatedExpression: () =>
      ObjectType_focusSparqlConstructTriplesFunctionExpression.call(this),
    unqualifiedName: "focusSparqlConstructTriples",
  });
}
