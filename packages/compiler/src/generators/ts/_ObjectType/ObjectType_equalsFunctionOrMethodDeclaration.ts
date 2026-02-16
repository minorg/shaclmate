import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_equalsFunctionOrMethodDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("equals")) {
    return Maybe.empty();
  }

  const chain: Code[] = [];
  let leftVariable: string;
  let parameters: Code;
  let preamble: string;
  let rightVariable: string;
  switch (this.declarationType) {
    case "class":
      if (this.ownProperties.length === 0) {
        // If there's a parent class and no properties in this class, can skip overriding equals
        return Maybe.empty();
      }

      leftVariable = "this";
      parameters = code`other: ${this.name}`;
      if (this.parentObjectTypes.length > 0) {
        chain.push(code`super.${syntheticNamePrefix}equals(other)`);
        preamble = "override ";
      } else {
        preamble = "";
      }
      rightVariable = "other";
      break;
    case "interface":
      // For every parent, find the nearest equals implementation
      for (const parentObjectType of this.parentObjectTypes) {
        chain.push(
          code`${parentObjectType.staticModuleName}.${syntheticNamePrefix}equals(left, right)`,
        );
      }
      leftVariable = "left";
      parameters = code`left: ${this.name}, right: ${this.name}`;
      preamble = "export function ";
      rightVariable = "right";
  }

  for (const property of this.ownProperties) {
    property.equalsFunction.ifJust((equalsFunction) => {
      chain.push(
        code`(${equalsFunction})(${leftVariable}.${property.name}, ${rightVariable}.${property.name}).mapLeft(propertyValuesUnequal => ({ left: ${leftVariable}, right: ${rightVariable}, propertyName: "${property.name}", propertyValuesUnequal, type: "Property" as const }))`,
      );
    });
  }

  return Maybe.of(code`\
${preamble}${syntheticNamePrefix}equals(${parameters}): ${snippets.EqualsResult} {
  return ${joinCode(
    chain.map((chainPart, chainPartI) =>
      chainPartI === 0 ? chainPart : code`chain(() => ${chainPart})`,
    ),
    { on: "." },
  )}
}`);
}
