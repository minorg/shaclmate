import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { tsComment } from "../tsComment.js";

export function typeAliasDeclaration(this: ObjectUnionType): Code {
  return code`\
${this.comment.alt(this.label).map(tsComment).orDefault("")}
export type ${this.name} = ${joinCode(
    this.memberTypes.map((memberType) => code`${memberType.name}`),
    { on: " | " },
  )};`;
}
