import {
  type FunctionDeclarationStructure,
  StructureKind,
  type TypeAliasDeclarationStructure,
} from "ts-morph";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

function fromJsonFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  return {
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
    statements: [
      `return ${this.memberTypes.reduce((expression, memberType) => {
        const memberTypeExpression = `(${memberType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as purify.Either<zod.ZodError, ${this.name}>)`;
        return expression.length > 0
          ? `${expression}.altLazy(() => ${memberTypeExpression})`
          : memberTypeExpression;
      }, "")};`,
    ],
  };
}

export function jsonDeclarations(
  this: ObjectUnionType,
): readonly (FunctionDeclarationStructure | TypeAliasDeclarationStructure)[] {
  if (!this.features.has("json")) {
    return [];
  }

  return [
    fromJsonFunctionDeclaration.bind(this)(),
    jsonTypeAliasDeclaration.bind(this)(),
    jsonZodSchemaFunctionDeclaration.bind(this)(),
    toJsonFunctionDeclaration.bind(this)(),
  ];
}

function jsonTypeAliasDeclaration(
  this: ObjectUnionType,
): TypeAliasDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Json`,
    type: this.memberTypes
      .map((memberType) => memberType.jsonName())
      .join(" | "),
  };
}

function jsonZodSchemaFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  const variables = { zod: "zod" };
  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}jsonZodSchema`,
    statements: `return ${variables.zod}.discriminatedUnion("${this._discriminantProperty.name}", [${this.memberTypes.map((memberType) => memberType.jsonZodSchema({ context: "type", variables })).join(", ")}]);`,
  };
}

function toJsonFunctionDeclaration(
  this: ObjectUnionType,
): FunctionDeclarationStructure {
  const caseBlocks = this.memberTypes.map((memberType) => {
    let returnExpression: string;
    switch (memberType.declarationType) {
      case "class":
        returnExpression = `${this.thisVariable}.${syntheticNamePrefix}toJson()`;
        break;
      case "interface":
        returnExpression = `${memberType.staticModuleName}.${syntheticNamePrefix}toJson(${this.thisVariable})`;
        break;
    }
    return `${memberType.discriminantPropertyValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${returnExpression};`;
  });
  caseBlocks.push(
    `default: ${this.thisVariable} satisfies never; throw new Error("unrecognized type");`,
  );

  return {
    isExported: true,
    kind: StructureKind.Function,
    name: `${syntheticNamePrefix}toJson`,
    parameters: [
      {
        name: this.thisVariable,
        type: this.name,
      },
    ],
    returnType: this.jsonName().toString(),
    statements: `switch (${this.thisVariable}.${this._discriminantProperty.name}) { ${caseBlocks.join(" ")} }`,
  };
}
