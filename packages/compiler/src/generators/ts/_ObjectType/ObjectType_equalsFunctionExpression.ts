import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const variables = {
  leftObject: code`left`,
  rightObject: code`right`,
};

export function ObjectType_equalsFunctionExpression(this: ObjectType): Code {
  const chain: Code[] = [];
  for (const property of this.properties) {
    chain.push(...property.equalsExpression({ variables }).toList());
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
