import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectType } from "../ObjectType.js";
import { tsComment } from "../tsComment.js";

export function interfaceDeclaration(this: ObjectType): Maybe<Code> {
  if (this.declarationType !== "interface") {
    return Maybe.empty();
  }

  return Maybe.of(code`\
${this.comment
  .alt(this.label)
  .map(tsComment)
  .map((comment) => `/* ${comment} */`)
  .orDefault("")}
export interface ${this.name}${
    this.parentObjectTypes.length > 0
      ? `extends ${this.parentObjectTypes
          .map((parentObjectType) => parentObjectType.name)
          .join(", ")}`
      : ""
  } {
  ${joinCode(
    this.properties.flatMap((property) => property.declaration.toList()),
  )}
}`);
}
