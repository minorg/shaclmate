import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function ObjectUnionType_toJsonFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
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
}`);
}
