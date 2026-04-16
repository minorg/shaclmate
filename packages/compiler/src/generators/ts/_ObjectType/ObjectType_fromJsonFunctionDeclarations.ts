import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  jsonObject: code`${syntheticNamePrefix}jsonObject`,
};

export function ObjectType_fromJsonFunctionDeclarations(
  this: ObjectType,
): readonly Code[] {
  const initializers: string[] = [];
  const propertiesFromJsonReturnType: Code[] = [];
  const propertiesFromJsonStatements: Code[] = [];
  const propertyReturnTypeSignatures: Code[] = [];

  propertiesFromJsonStatements.push(
    code`const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(_json);`,
    code`if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return ${imports.Left}(${syntheticNamePrefix}jsonSafeParseResult.error); }`,
    code`const ${variables.jsonObject} = ${syntheticNamePrefix}jsonSafeParseResult.data;`,
  );

  const chains: { expression: Code; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject})`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    propertiesFromJsonReturnType.push(
      code`${snippets.UnwrapR}<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson>>`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      propertiesFromJsonStatements.push(...propertyFromJsonStatements);
      initializers.push(property.name);
      propertyReturnTypeSignatures.push(
        code`${property.name}: ${property.type.name};`,
      );
    }
  }

  const resultExpression = `{ ${initializers.join(", ")} }`;
  if (chains.length === 0) {
    propertiesFromJsonStatements.push(
      code`return ${imports.Right}(${resultExpression})`,
    );
  } else {
    propertiesFromJsonStatements.push(
      code`return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            code`(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          code`(${resultExpression})`,
        )}`,
    );
  }

  if (propertyReturnTypeSignatures.length > 0) {
    propertiesFromJsonReturnType.splice(
      0,
      0,
      code`{ ${joinCode(propertyReturnTypeSignatures, { on: " " })} }`,
    );
  }

  const functionDeclarations: Code[] = [];

  functionDeclarations.push(code`\
export function ${syntheticNamePrefix}propertiesFromJson(_json: unknown): ${imports.Either}<${imports.z}.ZodError, ${joinCode(propertiesFromJsonReturnType, { on: " & " })}> {
${joinCode(propertiesFromJsonStatements)}
}`);

  if (this.abstract) {
    return functionDeclarations;
  }

  let propertiesFromJsonExpression = code`${syntheticNamePrefix}propertiesFromJson(json)`;
  if (this.declarationType === "class") {
    propertiesFromJsonExpression = code`${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
  }
  functionDeclarations.push(code`\
export function ${syntheticNamePrefix}fromJson(json: unknown): ${imports.Either}<${imports.z}.ZodError, ${this.name}> {
  return ${propertiesFromJsonExpression};
}`);

  return functionDeclarations;
}
