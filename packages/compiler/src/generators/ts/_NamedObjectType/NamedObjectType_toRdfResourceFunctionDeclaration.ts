import { rdf } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_toRdfResourceFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("rdf")) {
    return Maybe.empty();
  }

  const statements: Code[] = this.parentObjectTypes.map(
    (parentObjectType) =>
      code`${parentObjectType.name}._toRdfResource({ ...parameters, ignoreRdfType: true });`,
  );

  if (this.toRdfTypes.length > 0) {
    statements.push(
      code`if (!${variables.ignoreRdfType}) { ${joinCode(
        this.toRdfTypes.map(
          (toRdfType) =>
            code`${variables.resource}.add(${this.rdfjsTermExpression(rdf.type)}, ${this.reusables.imports.dataFactory}.namedNode("${toRdfType.value}"), ${variables.graph});`,
        ),
        { on: " " },
      )} }`,
    );
  }

  for (const property of this.properties) {
    statements.push(
      ...property.toRdfRdfResourceValuesStatements({
        variables: {
          graph: variables.graph,
          resource: variables.resource,
          resourceSet: variables.resourceSet,
          value: property.accessExpression({
            variables: { object: variables.object },
          }),
        },
      }),
    );
  }

  statements.push(code`return ${variables.resource};`);

  return Maybe.of(code`\
export const _toRdfResource: ${this.reusables.snippets._ToRdfResourceFunction}<${this.identifierTypeAlias}, ${this.name}> = (parameters) => {
${joinCode(statements)}
}

export const toRdfResource = ${this.reusables.snippets.wrap_ToRdfResourceFunction}(_toRdfResource);`);
}

const variables = {
  ignoreRdfType: code`parameters.ignoreRdfType`,
  graph: code`parameters.graph`,
  object: code`parameters.object`,
  resource: code`parameters.resource`,
  resourceSet: code`parameters.resourceSet`,
};
