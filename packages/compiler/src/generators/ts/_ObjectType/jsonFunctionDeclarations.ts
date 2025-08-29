import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";

function fromJsonFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  const deserializePropertiesReturnType: string[] = [];
  const initializers: string[] = [];
  const propertyReturnTypeSignatures: string[] = [];
  const propertiesFromJsonStatements: string[] = [];

  propertiesFromJsonStatements.push(
    `const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(_json);`,
    `if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return purify.Left(${syntheticNamePrefix}jsonSafeParseResult.error); }`,
    `const ${variables.jsonObject} = ${syntheticNamePrefix}jsonSafeParseResult.data;`,
  );

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromJsonStatements.push(
      `const ${syntheticNamePrefix}super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}.${syntheticNamePrefix}propertiesFromJson(${variables.jsonObject});`,
      `if (${syntheticNamePrefix}super${parentObjectTypeI}Either.isLeft()) { return ${syntheticNamePrefix}super${parentObjectTypeI}Either; }`,
      `const ${syntheticNamePrefix}super${parentObjectTypeI} = ${syntheticNamePrefix}super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`...${syntheticNamePrefix}super${parentObjectTypeI}`);
    deserializePropertiesReturnType.push(
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
  propertiesFromJsonStatements.push(
    `return purify.Either.of({ ${initializers.join(", ")} })`,
  );
  if (propertyReturnTypeSignatures.length > 0) {
    deserializePropertiesReturnType.splice(
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
    returnType: `purify.Either<zod.ZodError, ${deserializePropertiesReturnType.join(" & ")}>`,
    statements: propertiesFromJsonStatements,
  });

  let fromJsonStatements: string[];
  if (this.abstract) {
    if (this.childObjectTypes.length > 0) {
      // Similar to an object union type, alt-chain the fromJson of the different concrete subclasses together
      fromJsonStatements = [
        `return ${this.childObjectTypes.reduce(
          (expression, childObjectType) => {
            const childObjectTypeExpression = `(${childObjectType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
            return expression.length > 0
              ? `${expression}.altLazy(() => ${childObjectTypeExpression})`
              : childObjectTypeExpression;
          },
          "",
        )};`,
      ];
    } else {
      fromJsonStatements = [];
    }
  } else {
    let propertiesFromJsonExpression = `${syntheticNamePrefix}propertiesFromJson(json)`;
    if (this.declarationType === "class") {
      propertiesFromJsonExpression = `${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
    }

    if (this.childObjectTypes.length > 0) {
      fromJsonStatements = [
        `return ${this.childObjectTypes.reduce(
          (expression, childObjectType) => {
            const childObjectTypeExpression = `(${childObjectType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
            return expression.length > 0
              ? `${expression}.altLazy(() => ${childObjectTypeExpression})`
              : childObjectTypeExpression;
          },
          "",
        )}.altLazy(() => ${propertiesFromJsonExpression});`,
      ];
    } else {
      fromJsonStatements = [`return ${propertiesFromJsonExpression};`];
    }
  }

  if (fromJsonStatements.length > 0) {
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
      statements: fromJsonStatements,
    });
  }

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
      `return zodToJsonSchema(${syntheticNamePrefix}jsonZodSchema());`,
    ],
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
      `${parentObjectType.jsonZodSchema({ variables })}`,
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

export function jsonFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("json")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  return [
    ...fromJsonFunctionDeclarations.bind(this)(),
    jsonSchemaFunctionDeclaration.bind(this)(),
    jsonUiSchemaFunctionDeclaration.bind(this)(),
    ...toJsonFunctionDeclaration.bind(this)().toList(),
    jsonZodSchemaFunctionDeclaration.bind(this)(),
  ];
}

const variables = {
  jsonObject: "_jsonObject",
};
