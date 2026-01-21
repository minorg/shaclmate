import { Maybe } from "purify-ts";
import {
  type FunctionDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";

function fromJsonFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  const initializers: string[] = [];
  const propertiesFromJsonReturnType: string[] = [];
  const propertiesFromJsonStatements: string[] = [];
  const propertyReturnTypeSignatures: string[] = [];

  propertiesFromJsonStatements.push(
    `const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(_json);`,
    `if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return purify.Left(${syntheticNamePrefix}jsonSafeParseResult.error); }`,
    `const ${variables.jsonObject} = ${syntheticNamePrefix}jsonSafeParseResult.data;`,
  );

  const chains: { expression: string; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: `${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject})`,
      variable: `${syntheticNamePrefix}super${parentObjectTypeI}`,
    });
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    propertiesFromJsonReturnType.push(
      `${syntheticNamePrefix}UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson>>`,
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
        `${property.name}: ${property.type.name};`,
      );
    }
  }

  const resultExpression = `{ ${initializers.join(", ")} }`;
  if (chains.length === 0) {
    propertiesFromJsonStatements.push(
      `return purify.Either.of(${resultExpression})`,
    );
  } else {
    propertiesFromJsonStatements.push(
      `return ${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }, chainI) =>
            `(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
          `(${resultExpression})`,
        )}`,
    );
  }

  if (propertyReturnTypeSignatures.length > 0) {
    propertiesFromJsonReturnType.splice(
      0,
      0,
      `{ ${propertyReturnTypeSignatures.join(" ")} }`,
    );
  }

  const functionDeclarations: FunctionDeclarationStructure[] = [];

  functionDeclarations.push({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}propertiesFromJson`,
    parameters: [
      {
        name: "_json",
        type: "unknown",
      },
    ],
    returnType: `purify.Either<zod.ZodError, ${propertiesFromJsonReturnType.join(" & ")}>`,
    statements: propertiesFromJsonStatements,
  });

  if (this.abstract) {
    return functionDeclarations;
  }

  let propertiesFromJsonExpression = `${syntheticNamePrefix}propertiesFromJson(json)`;
  if (this.declarationType === "class") {
    propertiesFromJsonExpression = `${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
  }
  functionDeclarations.push({
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}fromJson`,
    parameters: [
      {
        name: "json",
        type: "unknown",
      },
    ],
    returnType: `purify.Either<zod.ZodError, ${this.name}>`,
    statements: [`return ${propertiesFromJsonExpression};`],
  });
  return functionDeclarations;
}

function jsonSchemaFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}jsonSchema`,
    statements: [
      `return zod.toJSONSchema(${syntheticNamePrefix}jsonZodSchema());`,
    ],
  };
}

export function jsonTypeAliasDeclaration(
  this: ObjectType,
): TypeAliasDeclarationStructure {
  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    members.push(
      `{ ${this.ownProperties
        .flatMap((property) => property.jsonPropertySignature.toList())
        .map(
          (propertySignature) =>
            `readonly "${propertySignature.name}"${propertySignature.hasQuestionToken ? "?" : ""}: ${propertySignature.type}`,
        )
        .join("; ")} }`,
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(parentObjectType.jsonType().name);
  }

  return {
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Json`,
    type: members.length > 0 ? members.join(" & ") : "object",
  };
}

function jsonUiSchemaFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const variables = { scopePrefix: "scopePrefix" };
  const elements: string[] = this.parentObjectTypes
    .map(
      (parentObjectType) =>
        `${parentObjectType.staticModuleName}.${syntheticNamePrefix}jsonUiSchema({ scopePrefix })`,
    )
    .concat(
      this.ownProperties.flatMap((property) =>
        property.jsonUiSchemaElement({ variables }).toList(),
      ),
    );

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}jsonUiSchema`,
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: "{ scopePrefix?: string }",
      },
    ],
    returnType: "any",
    statements: [
      'const scopePrefix = parameters?.scopePrefix ?? "#";',
      `return { "elements": [ ${elements.join(", ")} ], label: "${this.label.orDefault(this.name)}", type: "Group" }`,
    ],
  };
}

function jsonZodSchemaFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const variables = { zod: "zod" };
  const mergeZodObjectSchemas: string[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    mergeZodObjectSchemas.push(
      `${parentObjectType.jsonZodSchema({ context: "type", variables })}`,
    );
  }
  if (this.properties.length > 0) {
    mergeZodObjectSchemas.push(
      `${variables.zod}.object({ ${this.properties
        .flatMap((property) => property.jsonZodSchema({ variables }).toList())
        .map(({ key, schema }) => `"${key}": ${schema}`)
        .join(",")} })`,
    );
  }

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}jsonZodSchema`,
    statements: [
      `return ${
        mergeZodObjectSchemas.length > 0
          ? mergeZodObjectSchemas.reduce((merged, zodObjectSchema) => {
              if (merged.length === 0) {
                return zodObjectSchema;
              }
              return `${merged}.merge(${zodObjectSchema})`;
            }, "")
          : `${variables.zod}.object()`
      } satisfies zod.ZodType<${syntheticNamePrefix}Json>;`,
    ],
  };
}

function toJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<FunctionDeclarationStructure> {
  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  return toJsonFunctionOrMethodDeclaration
    .bind(this)()
    .map((toJsonFunctionOrMethodDeclaration) => ({
      ...toJsonFunctionOrMethodDeclaration,
      isExported: true,
      kind: StructureKind.Function,
      name: `${syntheticNamePrefix}toJson`,
    }));
}

export function jsonDeclarations(
  this: ObjectType,
): readonly (FunctionDeclarationStructure | TypeAliasDeclarationStructure)[] {
  if (!this.features.has("json")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  return [
    jsonTypeAliasDeclaration.bind(this)(),
    ...fromJsonFunctionDeclarations.bind(this)(),
    jsonSchemaFunctionDeclaration.bind(this)(),
    jsonUiSchemaFunctionDeclaration.bind(this)(),
    ...toJsonFunctionDeclaration.bind(this)().toList(),
    jsonZodSchemaFunctionDeclaration.bind(this)(),
  ];
}

const variables = {
  jsonObject: `${syntheticNamePrefix}jsonObject`,
};
