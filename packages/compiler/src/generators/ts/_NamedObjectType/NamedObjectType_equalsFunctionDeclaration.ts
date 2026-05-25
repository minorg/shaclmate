import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_equalsFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.equals")) {
    return Maybe.empty();
  }

  const chain: Code[] = [];
  // For every parent, find the nearest equals implementation
  for (const parentObjectType of this.parentObjectTypes) {
    chain.push(code`${parentObjectType.name}.equals(left, right)`);
  }

  for (const property of this.properties) {
    if (property.kind === "Discriminant") {
      continue;
    }

    chain.push(
      code`(${property.type.equalsFunction})(${property.accessExpression({ variables: { object: code`left` } })}, ${property.accessExpression({ variables: { object: code`right` } })}).mapLeft(propertyValuesUnequal => ({ left, right, propertyName: "${property.name}", propertyValuesUnequal, type: "property" as const }))`,
    );
  }

  return Maybe.of(code`\
export function equals(left: ${this.name}, right: ${this.name}): ${this.reusables.snippets.EqualsResult} {
  return ${joinCode(
    chain.map((chainPart, chainPartI) =>
      chainPartI === 0 ? chainPart : code`chain(() => ${chainPart})`,
    ),
    { on: "." },
  )}
}`);
}
