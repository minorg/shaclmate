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

  if (this.extern) {
    return Maybe.empty();
  }

  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParametersPropertySignature
      .map(
        (propertySignature) =>
          `readonly ${propertySignature.name}${propertySignature.hasQuestionToken ? "?" : ""}: ${propertySignature.type}`,
      )
      .toList(),
  );
  // Should always have at least an identifier
  invariant(parametersPropertySignatures.length > 0);
  const parametersType = [`{ ${parametersPropertySignatures.join(", ")} }`]
    .concat(
      this.parentObjectTypes.map(
        (parentObjectType) =>
          `Parameters<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}create>[0]`,
      ),
    )
    .join(" & ");

  const propertyInitializers: string[] = [];
  const omitPropertyNames: string[] = [];
  const propertyStatements: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    propertyInitializers.push(
      `...${parentObjectType.staticModuleName}.${syntheticNamePrefix}create(parameters)`,
    );
  }
  for (const property of this.properties) {
    const thisPropertyStatements = property.interfaceConstructorStatements({
      variables: { parameter: `parameters.${property.name}` },
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
        name: "parameters",
        type: parametersType,
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
