import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function createFunctionDeclaration(this: ObjectType): Maybe<Code> {
  if (!this.features.has("create")) {
    return Maybe.empty();
  }

  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParametersSignature.toList(),
  );

  const parametersType: Code[] = [];
  if (parametersPropertySignatures.length > 0) {
    parametersType.push(code`{ ${joinCode(parametersPropertySignatures)} }`);
  }
  for (const parentObjectType of this.parentObjectTypes) {
    parametersType.push(
      code`Parameters<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}create>[0]`,
    );
  }
  if (parametersType.length === 0) {
    parametersType.push(code`object`);
  }

  const propertyInitializers: string[] = [];
  const omitPropertyNames: string[] = [];
  const propertyStatements: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    propertyInitializers.push(
      `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}create(parameters)`,
    );
  }
  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) =>
        propertySignature.toCodeString([]).indexOf("?:") !== -1,
    );
  const parametersVariable = code`parameters${parametersHasQuestionToken ? "?" : ""}`;
  for (const property of this.properties) {
    const thisPropertyStatements = property.constructorStatements({
      variables: {
        parameter: code`${parametersVariable}.${property.name}`,
        parameters: parametersVariable,
      },
    });
    if (thisPropertyStatements.length > 0) {
      propertyInitializers.push(property.name);
      propertyStatements.push(...thisPropertyStatements);
    } else {
      omitPropertyNames.push(property.name);
    }
  }
  invariant(propertyInitializers.length > 0);
  invariant(propertyStatements.length > 0);

  return Maybe.of(code`\
export function ${syntheticNamePrefix}create(parameters${parametersHasQuestionToken ? "?" : ""}: ${joinCode(parametersType, { on: " & " })}): ${omitPropertyNames.length === 0 ? this.name : `Omit<${this.name}, ${omitPropertyNames.map((omitPropertyName) => `"${omitPropertyName}"`).join(" | ")}>`} {
  ${joinCode(propertyStatements)}
  return { ${propertyInitializers.join(", ")} };
}`);
}
