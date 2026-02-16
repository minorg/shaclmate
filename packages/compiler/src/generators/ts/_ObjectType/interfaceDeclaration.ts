import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { tsComment } from "../tsComment.js";

export function interfaceDeclaration(this: ObjectType): Code {
  return code`\
${this.comment.alt(this.label).map(tsComment).orDefault("")}
export interface ${this.name}${
    this.parentObjectTypes.length > 0
      ? ` extends ${this.parentObjectTypes
          .map((parentObjectType) => parentObjectType.name)
          .join(", ")}`
      : ""
  } {
  ${joinCode(
    this.properties.flatMap((property) => property.declaration.toList()),
  )}
}`;
}
