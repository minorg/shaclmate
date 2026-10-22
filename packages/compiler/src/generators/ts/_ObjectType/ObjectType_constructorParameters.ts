import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_constructorParameters(this: ObjectType) {
  let hasQuestionToken: boolean = true;
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  const propertySignatures: Code[] = [
    code`readonly ${syntheticNamePrefix}defaultNamespace?: ${syntheticNamePrefix}DefaultNamespaceT;`,
  ];
  for (const property of this.properties) {
    property.constructorParameter.ifJust((propertyConstructorParameter) => {
      hasQuestionToken =
        hasQuestionToken && propertyConstructorParameter.hasQuestionToken;
      propertySignatures.push(propertyConstructorParameter.signature);
    });
  }

  const typeExpression = code`{ ${joinCode(propertySignatures)} }`;

  return {
    hasQuestionToken,
    signature: code`parameters${hasQuestionToken ? "?" : ""}: ${typeExpression}`,
    type: {
      expression: typeExpression,
    },
    variable: code`parameters`,
  };
}
