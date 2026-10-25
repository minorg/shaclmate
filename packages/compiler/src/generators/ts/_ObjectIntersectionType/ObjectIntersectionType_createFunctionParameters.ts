import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_createFunctionParameters(
  this: ObjectIntersectionType,
): ObjectType.CreateFunctionParameters {
  let hasQuestionToken: boolean = true;
  const memberTypeExpressions: Code[] = [];
  for (const member of this.members) {
    if (!member.type.createFunctionParameters.hasQuestionToken) {
      hasQuestionToken = false;
    }
    memberTypeExpressions.push(
      member.type.createFunctionParameters.type.expression,
    );
  }

  const typeInlineExpression = joinCode(memberTypeExpressions, { on: " & " });
  const type = {
    expression: this.name
      .map(
        (name) =>
          code`${name}.CreateParameters<${this.configuration.syntheticNamePrefix}DefaultNamespaceT>`,
      )
      .orDefault(typeInlineExpression),
    inlineExpression: typeInlineExpression,
  };

  return {
    hasQuestionToken,
    signature: code`parameters${hasQuestionToken ? "?" : ""}: ${type.expression}`,
    type,
    variable: code`parameters`,
  };
}
