import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  jsonObject: code`${syntheticNamePrefix}json`,
};

export function NamedObjectType_fromJsonFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const initializers: Code[] = [];
  const statements: Code[] = [];

  this.parentObjectTypes.forEach((parentObjectType) => {
    initializers.push(
      code`...${parentObjectType.name}.fromJson(${variables.jsonObject})`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      initializers.push(code`${property.name}`);
      statements.push(...propertyFromJsonStatements);
    }
  }
  statements.push(
    code`return create({ ${joinCode(initializers, { on: ", " })} });`,
  );

  return Maybe.of(code`\
export function fromJson(${variables.jsonObject}: ${this.jsonType().name}): ${this.name} {
${joinCode(statements, { on: "\n" })}
}`);
}
