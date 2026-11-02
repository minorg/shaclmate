import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionParameters(
  this: ObjectType,
): ObjectType.CreateFunctionParameters {
  let hasQuestionToken: boolean = true;
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  const propertySignatures: Code[] = [
    code`readonly ${syntheticNamePrefix}defaultNamespace?: ${syntheticNamePrefix}DefaultNamespaceT;`,
  ];
  for (const property of this.properties) {
    property.createFunctionParameter.ifJust((propertyConstructorParameter) => {
      hasQuestionToken =
        hasQuestionToken && propertyConstructorParameter.hasQuestionToken;
      propertySignatures.push(propertyConstructorParameter.signature);
    });
  }
  const typeInlineExpression = code`{ ${joinCode(propertySignatures)} }`;
  const type = {
    expression: this.name
      .map(
        (name) =>
          code`${name}.CreateParameters<${syntheticNamePrefix}DefaultNamespaceT>`,
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
