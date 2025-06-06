import { type FunctionDeclarationStructure, StructureKind } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

const variables = {
  jsonObject: "_jsonObject",
};

export function fromJsonFunctionDeclarations(
  this: ObjectType,
): readonly FunctionDeclarationStructure[] {
  if (!this.features.has("fromJson")) {
    return [];
  }

  if (this.extern) {
    return [];
  }

  const initializers: string[] = [];
  const propertyReturnTypeSignatures: string[] = [];
  const propertiesFromJsonFunctionReturnType: string[] = [];
  const propertiesFromJsonFunctionStatements: string[] = [];

  propertiesFromJsonFunctionStatements.push(
    "const _jsonSafeParseResult = jsonZodSchema().safeParse(_json);",
    "if (!_jsonSafeParseResult.success) { return purify.Left(_jsonSafeParseResult.error); }",
    `const ${variables.jsonObject} = _jsonSafeParseResult.data;`,
  );

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    propertiesFromJsonFunctionStatements.push(
      `const _super${parentObjectTypeI}Either = ${parentObjectType.staticModuleName}._propertiesFromJson(${variables.jsonObject});`,
      `if (_super${parentObjectTypeI}Either.isLeft()) { return _super${parentObjectTypeI}Either; }`,
      `const _super${parentObjectTypeI} = _super${parentObjectTypeI}Either.unsafeCoerce()`,
    );
    initializers.push(`..._super${parentObjectTypeI}`);
    propertiesFromJsonFunctionReturnType.push(
      `UnwrapR<ReturnType<typeof ${parentObjectType.staticModuleName}._propertiesFromJson>>`,
    );
  });

  for (const property of this.properties) {
    const propertyFromJsonStatements = property.fromJsonStatements({
      variables,
    });
    if (propertyFromJsonStatements.length > 0) {
      propertiesFromJsonFunctionStatements.push(...propertyFromJsonStatements);
      initializers.push(property.name);
      propertyReturnTypeSignatures.push(
        `${property.name}: ${property.type.name};`,
      );
    }
  }
  propertiesFromJsonFunctionStatements.push(
    `return purify.Either.of({ ${initializers.join(", ")} })`,
  );
  if (propertyReturnTypeSignatures.length > 0) {
    propertiesFromJsonFunctionReturnType.splice(
      0,
      0,
      `{ ${propertyReturnTypeSignatures.join(" ")} }`,
    );
  }

  const fromJsonFunctionDeclarations: FunctionDeclarationStructure[] = [];

  fromJsonFunctionDeclarations.push({
    isExported: true,
    kind: StructureKind.Function,
    name: "_propertiesFromJson",
    parameters: [
      {
        name: "_json",
        type: "unknown",
      },
    ],
    returnType: `purify.Either<zod.ZodError, ${propertiesFromJsonFunctionReturnType.join(" & ")}>`,
    statements: propertiesFromJsonFunctionStatements,
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
    let propertiesFromJsonExpression: string;
    switch (this.declarationType) {
      case "class":
        propertiesFromJsonExpression = `${this.staticModuleName}._propertiesFromJson(json).map(properties => new ${this.name}(properties))`;
        break;
      case "interface":
        propertiesFromJsonExpression = `${this.staticModuleName}._propertiesFromJson(json)`;
        break;
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
    fromJsonFunctionDeclarations.push({
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

  return fromJsonFunctionDeclarations;
}
