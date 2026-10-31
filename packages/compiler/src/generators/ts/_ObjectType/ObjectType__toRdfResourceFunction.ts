import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectType__toRdfResourceFunctionExpression(this: ObjectType): Code {
  const statements: Code[] = [];

  const variables = {
    ignoreRdfType: code`parameters.ignoreRdfType`,
    graph: code`parameters.graph`,
    object: code`parameters.object`,
    objectSchema: this.schemaVariable,
    resource: code`parameters.resource`,
    resourceSet: code`parameters.resourceSet`,
  };

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfResourceValuesStatements({
        variables,
      }),
    );
  }

  statements.push(code`return ${variables.resource};`);

  return code`\
(parameters) => {
  ${joinCode(statements)}
}`;
}

export function ObjectType__toRdfResourceFunction(this: ObjectType): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);

  return this._function({
    type: code`${this.reusables.snippets._ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>`,
    unannotatedExpression: () =>
      ObjectType__toRdfResourceFunctionExpression.call(this),
    unqualifiedName: "_toRdfResource",
  });
}
