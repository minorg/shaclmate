import { Maybe } from "purify-ts";
import type { OptionalKind, ParameterDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";

export function equalsFunctionOrMethodDeclaration(this: ObjectType): Maybe<{
  hasOverrideKeyword: boolean;
  name: string;
  parameters: OptionalKind<ParameterDeclarationStructure>[];
  returnType: string;
  statements: string[];
}> {
  if (!this.features.has("equals")) {
    return Maybe.empty();
  }

  if (this.declarationType === "class" && this.ownProperties.length === 0) {
    // If there's a parent class and no properties in this class, can skip overriding equals
    return Maybe.empty();
  }

  let leftVariable: string;
  let rightVariable: string;
  switch (this.declarationType) {
    case "class":
      leftVariable = "this";
      rightVariable = "other";
      break;
    case "interface":
      leftVariable = "left";
      rightVariable = "right";
  }

  const chain: string[] = [];

  let hasOverrideKeyword = false;
  if (this.parentObjectTypes.length > 0) {
    switch (this.declarationType) {
      case "class": {
        chain.push("super.equals(other)");
        hasOverrideKeyword = true;
        break;
      }
      case "interface": {
        // For every parent, find the nearest equals implementation
        for (const parentObjectType of this.parentObjectTypes) {
          chain.push(
            `${parentObjectType.staticModuleName}.equals(left, right)`,
          );
        }
        break;
      }
    }
  }

  for (const property of this.ownProperties) {
    chain.push(
      `(${property.equalsFunction})(${leftVariable}.${property.name}, ${rightVariable}.${property.name}).mapLeft(propertyValuesUnequal => ({ left: ${leftVariable}, right: ${rightVariable}, propertyName: "${property.name}", propertyValuesUnequal, type: "Property" as const }))`,
    );
  }

  return Maybe.of({
    hasOverrideKeyword,
    name: "equals",
    parameters:
      this.declarationType === "interface"
        ? [
            {
              name: "left",
              type: this.name,
            },
            {
              name: "right",
              type: this.name,
            },
          ]
        : [
            {
              name: "other",
              type: this.name,
            },
          ],
    returnType: "$EqualsResult",
    statements: [
      `return ${chain
        .map((chainPart, chainPartI) =>
          chainPartI === 0 ? chainPart : `chain(() => ${chainPart})`,
        )
        .join(".")};`,
    ],
  });
}
