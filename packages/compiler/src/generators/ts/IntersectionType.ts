import { Memoize } from "typescript-memoize";
import { AbstractIntersectionType } from "./AbstractIntersectionType.js";
import type { Type } from "./Type.js";
import { type Code, joinCode } from "./ts-poet-wrapper.js";

export class IntersectionType extends AbstractIntersectionType<Type> {
  override readonly kind = "Intersection";

  @Memoize()
  protected override get inlineExpression(): Code {
    return joinCode(
      this.members.map((member) => member.type.expression),
      { on: "&" },
    );
  }
}
