import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

function ObjectIntersectionType_createFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  const parametersVariable = this.createFunctionParameters.variable;

  let returnExpression = code`\
    ${joinCode(
      this.members.map(
        (member, memberI) =>
          code`(${member.type.createFunction.unannotatedUsage})(${parametersVariable}).${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}`;

  const monkeyPatchMethods: Record<string, Code> = {};
  if (this.configuration.features.has("Object.toJson")) {
    monkeyPatchMethods["toJson"] = this.toJsonFunction.annotatedUsage;
  }
  if (this.configuration.features.has("Object.toString")) {
    monkeyPatchMethods[`${this.configuration.syntheticNamePrefix}toString`] =
      this.toStringFunction.annotatedUsage;
  }
  if (Object.keys(monkeyPatchMethods).length > 0) {
    returnExpression = code`${returnExpression}.map(object => ${this.reusables.snippets.monkeyPatchObject}(object, ${monkeyPatchMethods}))`;
  }

  return code`(${parametersVariable}) => ${returnExpression}`;
}

export function ObjectIntersectionType_createFunction(
  this: ObjectIntersectionType,
): Callable {
  return this._function({
    type: code`<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.createFunctionParameters.signature}) => ${this.reusables.imports.Either}<Error, ${this.expression}>`,
    unannotatedExpression: () =>
      ObjectIntersectionType_createFunctionExpression.call(this),
    unqualifiedName: "create",
  });
}
