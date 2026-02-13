import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { sharedImports } from "../sharedImports.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

function fromJsonFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}fromJson(json: unknown): ${sharedImports.Either}<zod.ZodError, ${this.name}> {
  return ${this.concreteMemberTypes.reduce(
    (expression, memberType) => {
      const memberTypeExpression = code`(${memberType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as ${sharedImports.Either}<${sharedImports.z}.ZodError, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};
}`;
}

export function jsonDeclarations(this: ObjectUnionType): readonly Code[] {
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

function jsonTypeAliasDeclaration(this: ObjectUnionType): Code {
  return code`export type ${syntheticNamePrefix}Json = ${joinCode(
    this.concreteMemberTypes.map((memberType) => memberType.jsonType().name),
    { on: " | " },
  )}`;
}

function jsonZodSchemaFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}jsonZodSchema() {
  return ${sharedImports.z}.discriminatedUnion("${this._discriminantProperty.name}", [${joinCode(
    this.concreteMemberTypes.map((memberType) =>
      memberType.jsonZodSchema({ context: "type" }),
    ),
    { on: ", " },
  )}]);
}`;
}

function toJsonFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}toJson(${this.thisVariable}: ${this.name}): ${this.jsonType().name} {
${joinCode(
  this.concreteMemberTypes
    .map((memberType) => {
      let returnExpression: Code;
      switch (memberType.declarationType) {
        case "class":
          returnExpression = code`${this.thisVariable}.${syntheticNamePrefix}toJson()`;
          break;
        case "interface":
          returnExpression = code`${memberType.staticModuleName}.${syntheticNamePrefix}toJson(${this.thisVariable})`;
          break;
      }
      return code`if (${memberType.staticModuleName}.is${memberType.name}(${this.thisVariable})) { return ${returnExpression}; }`;
    })
    .concat(code`throw new Error("unrecognized type");`),
)}
}`;
}
