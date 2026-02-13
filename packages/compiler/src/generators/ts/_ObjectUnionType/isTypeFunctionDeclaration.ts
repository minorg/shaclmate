import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function isTypeFunctionDeclaration(this: ObjectUnionType): Maybe<Code> {
  if (this.nameString === `${syntheticNamePrefix}Object`) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function is${this.name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
  return ${joinCode(
    this.memberTypes.map(
      (memberType) =>
        code`${memberType.staticModuleName}.is${memberType.name}(object)`,
    ),
    { on: " || " },
  )};
}`);
}
