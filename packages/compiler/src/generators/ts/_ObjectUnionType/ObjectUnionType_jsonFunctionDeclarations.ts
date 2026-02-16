import { type Code, code, joinCode } from "ts-poet";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

function ObjectUnionType_fromJsonFunctionDeclaration(
  this: ObjectUnionType,
): Code {
  return code`\
export function ${syntheticNamePrefix}fromJson(json: unknown): ${imports.Either}<${imports.z}.ZodError, ${this.name}> {
  return ${this.concreteMemberTypes.reduce(
    (expression, memberType) => {
      const memberTypeExpression = code`(${memberType.staticModuleName}.${syntheticNamePrefix}fromJson(json) as ${imports.Either}<${imports.z}.ZodError, ${this.name}>)`;
      return expression !== null
        ? code`${expression}.altLazy(() => ${memberTypeExpression})`
        : memberTypeExpression;
    },
    null as Code | null,
  )};
}`;
}

export function jsonFunctionDeclarations(
  this: ObjectUnionType,
): readonly Code[] {
  if (!this.features.has("json")) {
    return [];
  }

  return [
    ObjectUnionType_fromJsonFunctionDeclaration.bind(this)(),
    jsonZodSchemaFunctionDeclaration.bind(this)(),
    toJsonFunctionDeclaration.bind(this)(),
  ];
}

function jsonZodSchemaFunctionDeclaration(this: ObjectUnionType): Code {
  return code`\
export function ${syntheticNamePrefix}jsonZodSchema() {
  return ${imports.z}.discriminatedUnion("${this._discriminantProperty.name}", [${joinCode(
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
