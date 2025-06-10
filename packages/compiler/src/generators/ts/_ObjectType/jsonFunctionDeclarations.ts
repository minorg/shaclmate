import { Maybe } from "purify-ts";
import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";

import type { ObjectType } from "../ObjectType.js";
import { toJsonFunctionOrMethodDeclaration } from "./toJsonFunctionOrMethodDeclaration.js";

function fromJsonFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  const deserializePropertiesReturnType: string[] = [];
  const initializers: string[] = [];
  const propertyReturnTypeSignatures: string[] = [];
  const propertiesFromJsonStatements: string[] = [];

  propertiesFromJsonStatements.push(
    "const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);",
    "if (!_jsonSafeParseResult.success) { return purify.Left(_jsonSafeParseResult.error); }",
    `const ${variables.jsonObject} = _jsonSafeParseResult.data;`,
  );

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromJsonStatements.push(
      `const _super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}.propertiesFromJson(${variables.jsonObject});`,
      `if (_super${parentObjectTypeI}Either.isLeft()) { return _super${parentObjectTypeI}Either; }`,
      `const _super${parentObjectTypeI} = _super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`..._super${parentObjectTypeI}`);
    deserializePropertiesReturnType.push(
      `$UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}.propertiesFromJson>>`,
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
    name: "propertiesFromJson",
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
            const childObjectTypeExpression = `(${childObjectType.staticModuleName}.fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
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
    let propertiesFromJsonExpression = "propertiesFromJson(json)";
    if (this.declarationType === "class") {
      propertiesFromJsonExpression = `${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
    }

    if (this.childObjectTypes.length > 0) {
      fromJsonStatements = [
        `return ${this.childObjectTypes.reduce(
          (expression, childObjectType) => {
            const childObjectTypeExpression = `(${childObjectType.staticModuleName}.fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
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
      name: "fromJson",
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
    name: "jsonSchema",
    statements: ["return zodToJsonSchema(jsonZodSchema());"],
  };
}

function jsonUiSchemaFunctionDeclaration(
  this: ObjectType,
): FunctionDeclarationStructure {
  const variables = { scopePrefix: "scopePrefix" };
  const elements: string[] = this.parentObjectTypes
    .map(
      (parentObjectType) =>
        `${parentObjectType.staticModuleName}.jsonUiSchema({ scopePrefix })`,
    )
    .concat(
      this.ownProperties.flatMap((property) =>
        property.jsonUiSchemaElement({ variables }).toList(),
      ),
    );

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: "jsonUiSchema",
    parameters: [
      {
        hasQuestionToken: true,
        name: "parameters",
        type: "{ scopePrefix?: string }",
      },
    ],
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
    name: "jsonZodSchema",
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
      };`,
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
      name: "toJson",
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
