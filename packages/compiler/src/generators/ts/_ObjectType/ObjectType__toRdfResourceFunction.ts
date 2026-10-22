import { rdf } from "@tpluscode/rdf-ns-builders";
import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectType__toRdfResourceFunctionExpression(this: ObjectType): Code {
  const statements: Code[] = [];

  this.toRdfTypesVariable.ifJust((toRdfTypesVariable) => {
    statements.push(
      code`if (!${variables.ignoreRdfType}) { ${variables.resource}.add(${this.rdfjsTermExpression(rdf.type)}, ${toRdfTypesVariable}, ${variables.graph}); }`,
    );
  });

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfRdfResourceValuesStatements({
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

const variables = {
  ignoreRdfType: code`parameters.ignoreRdfType`,
  graph: code`parameters.graph`,
  object: code`parameters.object`,
  resource: code`parameters.resource`,
  resourceSet: code`parameters.resourceSet`,
};

export function ObjectType__toRdfResourceFunction(this: ObjectType): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);
  const type = code`${this.reusables.snippets._ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>`;
  const unannotatedExpression = () =>
    ObjectType__toRdfResourceFunctionExpression.call(this);

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "_toRdfResourceFunction"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
