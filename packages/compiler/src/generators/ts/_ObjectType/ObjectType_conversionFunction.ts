import { Maybe } from "purify-ts";
import type { AbstractType_ConversionFunction } from "../_AbstractType/AbstractType_ConversionFunction.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_conversionFunction(
  this: ObjectType,
): Maybe<AbstractType_ConversionFunction> {
  if (this.name.isJust()) {
    return Maybe.empty();
  }

  const sourceTypePropertySignatures: Code[] = [];
  for (const property of this.properties) {
    property.constructorParameter.ifJust((propertyConstructorParameter) => {
      sourceTypePropertySignatures.push(propertyConstructorParameter.signature);
    });
  }
  const sourceTypeExpression = code`{ ${joinCode(sourceTypePropertySignatures)} }`;
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return Maybe.of({
    code: code`(<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(value: ${sourceTypeExpression}, ${syntheticNamePrefix}defaultNamespace?: ${syntheticNamePrefix}DefaultNamespaceT) => ${this.createFunction.unannotatedUsage}({ ...value, ${syntheticNamePrefix}defaultNamespace }))`,
    sourceTypes: [
      {
        expression: sourceTypeExpression,
        jsType: {
          instanceof: "Object",
          typeof: "object",
        },
      },
    ],
  });
}
