import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_equalsFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.equals")) {
    return Maybe.empty();
  }

  const chain: Code[] = [];
  for (const property of this.properties) {
    if (property.kind === "Discriminant") {
      continue;
    }

    chain.push(
      code`(${property.type.equalsFunction})(${property.accessExpression({ variables: { object: code`left` } })}, ${property.accessExpression({ variables: { object: code`right` } })}).mapLeft(propertyValuesUnequal => ({ left, right, propertyName: "${property.name}", propertyValuesUnequal, type: "property" as const }))`,
    );
  }

  return Maybe.of(code`\
export function equals(left: ${this.expression}, right: ${this.expression}): ${this.reusables.snippets.EqualsResult} {
  return ${joinCode(
    chain.map((chainPart, chainPartI) =>
      chainPartI === 0 ? chainPart : code`chain(() => ${chainPart})`,
    ),
    { on: "." },
  )}
}`);
}
