import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_equalsFunctionExpression(this: ObjectType): Code {
  const chain: Code[] = [];
  for (const property of this.properties) {
    if (property.kind === "Discriminant") {
      continue;
    }

    chain.push(
      code`${this.reusables.snippets.propertyEquals}(
        { equalsFunction: ${property.type.equalsFunction}, name: ${literalOf(property.name)} },
        [left, ${property.accessExpression({ variables: { object: code`left` } })}],
        [right, ${property.accessExpression({ variables: { object: code`right` } })}],
      )`,
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
