import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

const variables = {
  jsonObject: "_jsonObject",
};

export function jsonParseFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("json")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  const initializers: string[] = [];
  const propertyReturnTypeSignatures: string[] = [];
  const propertiesFromJsonReturnType: string[] = [];
  const propertiesFromJsonStatements: string[] = [];

  propertiesFromJsonStatements.push(
    "const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);",
    "if (!_jsonSafeParseResult.success) { return purify.Left(_jsonSafeParseResult.error); }",
    `const ${variables.jsonObject} = _jsonSafeParseResult.data;`,
  );

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromJsonStatements.push(
      `const _super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}._propertiesFromJson(${variables.jsonObject});`,
      `if (_super${parentObjectTypeI}Either.isLeft()) { return _super${parentObjectTypeI}Either; }`,
      `const _super${parentObjectTypeI} = _super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`..._super${parentObjectTypeI}`);
    propertiesFromJsonReturnType.push(
      `UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}._propertiesFromJson>>`,
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
    propertiesFromJsonReturnType.splice(
      0,
      0,
      `{ ${propertyReturnTypeSignatures.join(" ")} }`,
    );
  }

  const functionDeclarations: FunctionDeclarationStructure[] = [];

  functionDeclarations.push({
    kind: StructureKind.Function,
    name: "jsonParseProperties",
    parameters: [
      {
        name: "_json",
        type: "unknown",
      },
    ],
    returnType: `purify.Either<zod.ZodError, ${propertiesFromJsonReturnType.join(" & ")}>`,
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
    let propertiesFromJsonExpression = "jsonParseProperties(json)";
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
      kind: StructureKind.Function,
      name: "jsonParse",
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
