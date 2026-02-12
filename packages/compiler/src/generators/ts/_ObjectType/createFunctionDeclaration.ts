import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function createFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (!this.features.has("create")) {
    return Maybe.empty();
  }

  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParametersSignature.toList(),
  );

  const parametersType: string[] = [];
  if (parametersPropertySignatures.length > 0) {
    parametersType.push(
      `{ ${parametersPropertySignatures
        .map(
          (propertySignature) =>
            `readonly ${propertySignature.name}${propertySignature.hasQuestionToken ? "?" : ""}: ${propertySignature.type}`,
        )
        .join(", ")} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    parametersType.push(
      `Parameters<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}create>[0]`,
    );
  }
  if (parametersType.length === 0) {
    parametersType.push("object");
  }

  const propertyInitializers: string[] = [];
  const omitPropertyNames: string[] = [];
  const propertyStatements: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    propertyInitializers.push(
      `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}create(parameters)`,
    );
  }
  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) => !!propertySignature.hasQuestionToken,
    );
  const parametersVariable = `parameters${parametersHasQuestionToken ? "?" : ""}`;
  for (const property of this.properties) {
    const thisPropertyStatements = property.constructorStatements({
      variables: {
        parameter: `${parametersVariable}.${property.name}`,
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

  return Maybe.of({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}create`,
    parameters: [
      {
        hasQuestionToken: parametersHasQuestionToken,
        name: "parameters",
        type: parametersType.join(" & "),
      },
    ],
    returnType:
      omitPropertyNames.length === 0
        ? this.name
        : `Omit<${this.name}, ${omitPropertyNames.map((omitPropertyName) => `"${omitPropertyName}"`).join(" | ")}>`,
    statements: propertyStatements.concat([
      `return { ${propertyInitializers.join(", ")} }`,
    ]),
  });
}
