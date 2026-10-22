import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

const hasherVariable = code`hasher`;

export function ObjectType_hashFunctionExpression(this: ObjectType): Code {
  return code`(${hasherVariable}, ${this.thisVariable}) => { ${joinCode(
    this.properties.flatMap((property) =>
      property.hashStatements({
        variables: {
          hasher: hasherVariable,
          object: code`${this.thisVariable}`,
        },
      }),
    ),
  )} }`;
}
