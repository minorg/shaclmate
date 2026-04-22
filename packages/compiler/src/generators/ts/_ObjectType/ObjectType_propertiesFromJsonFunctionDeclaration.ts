import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  jsonObject: code`${syntheticNamePrefix}json`,
};

export function ObjectType_propertiesFromJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const initializers: Code[] = [];
  const statements: Code[] = [];
  const propertyReturnTypeSignatures: Code[] = [];
  const returnType: Code[] = [];

  this.parentObjectTypes.forEach((parentObjectType) => {
    initializers.push(
      code`...${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject})`,
    );
    returnType.push(
      code`ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson>`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      propertyReturnTypeSignatures.push(
        code`${property.name}: ${property.type.name};`,
      );
      initializers.push(code`${property.name}`);
      statements.push(...propertyFromJsonStatements);
    }
  }
  statements.push(code`return { ${joinCode(initializers, { on: ", " })} };`);

  if (propertyReturnTypeSignatures.length > 0) {
    returnType.splice(
      0,
      0,
      code`{ ${joinCode(propertyReturnTypeSignatures, { on: " " })} }`,
    );
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject}: ${this.jsonType().name}): ${joinCode(returnType, { on: " & " })} {
${joinCode(statements)}
}`);
}
