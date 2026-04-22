import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
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

  const initializers: string[] = [];
  const returnType: Code[] = [];
  const statements: Code[] = [];
  const returnTypeSignatures: Code[] = [];

  const chains: { expression: Code; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject})`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    returnType.push(
      code`ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson>`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      statements.push(...propertyFromJsonStatements);
      initializers.push(property.name);
      returnTypeSignatures.push(code`${property.name}: ${property.type.name};`);
    }
  }

  const resultExpression = `{ ${initializers.join(", ")} }`;
  if (chains.length === 0) {
    statements.push(code`return ${resultExpression}`);
  } else {
    statements.push(
      code`return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            code`(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          code`(${resultExpression})`,
        )}`,
    );
  }

  if (returnTypeSignatures.length > 0) {
    returnType.splice(
      0,
      0,
      code`{ ${joinCode(returnTypeSignatures, { on: " " })} }`,
    );
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject}: ${this.jsonType().name}): ${joinCode(returnType, { on: " & " })} {
${joinCode(statements)}
}`);
}
