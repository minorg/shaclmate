import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_equalsFunctionExpression(this: ObjectType): Code {
  const chain: Code[] = [];
  for (const property of this.properties) {
    if (property.kind === "Discriminant") {
      continue;
    }

    chain.push(
      code`(${property.type.equalsFunction})(${property.accessExpression({ variables: { object: code`left` } })}, ${property.accessExpression({ variables: { object: code`right` } })}).mapLeft(propertyValuesUnequal => ({ left, right, propertyName: "${property.name}", propertyValuesUnequal, type: "property" as const }))`,
    );
  }

  return code`\
((left, right) =>
  ${joinCode(
    chain.map((chainPart, chainPartI) =>
      chainPartI === 0 ? chainPart : code`chain(() => ${chainPart})`,
    ),
    { on: "." },
  )}
)`;
}
