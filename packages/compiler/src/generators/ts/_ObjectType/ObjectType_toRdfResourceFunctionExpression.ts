import { rdf } from "@tpluscode/rdf-ns-builders";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceFunctionExpression(
  this: ObjectType,
): Code {
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
((parameters) => {
  ${joinCode(statements)}
})`;
}

const variables = {
  ignoreRdfType: code`parameters.ignoreRdfType`,
  graph: code`parameters.graph`,
  object: code`parameters.object`,
  resource: code`parameters.resource`,
  resourceSet: code`parameters.resourceSet`,
};
